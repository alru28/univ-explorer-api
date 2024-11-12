from fastapi import FastAPI, Request, HTTPException, Response, Depends
from fastapi.openapi.docs import get_swagger_ui_html


import yaml
import httpx
import os

# MICROSERVICES
COLLECTION_SERVICE_URL = os.getenv("COLLECTION_SERVICE_URL", "http://collection-service:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:3000")
EXPLORATION_SERVICE_URL = os.getenv("EXPLORATION_SERVICE_URL", "http://exploration-service:8000")

# GATEWAY HELPER FUNCTIONS

# Verify JWT
async def verify_jwt(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Authorization token is missing")

    # Send to auth-service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_SERVICE_URL}/verify", headers={"Authorization": token})

            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user_info = response.json().get("user")
            if not user_info or "username" not in user_info:
                raise HTTPException(status_code=401, detail="Invalid user info")
            return user_info["username"]  # Return the username
        
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=500, detail="Authentication service error")

# Proxy
async def proxy_request(request: Request, target_url: str, headers=None):
    method = request.method
    print(target_url)
    content = await request.body()

    headers = headers or dict(request.headers)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            
            response = await client.request(method, target_url, headers=headers, content=content)
            return Response(content=response.content, status_code=response.status_code, headers=response.headers)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=500, detail=f"Gateway error: {str(exc)}")

# GATEWAY APP
app = FastAPI(title="UnivExplorer API", openapi_url = None)

@app.api_route("/collection/{path:path}", methods=["GET", "POST", "PUT", "DELETE"], include_in_schema=False)
async def collection_service_proxy(path: str, request: Request, token_verified: str = Depends(verify_jwt)):
    target_url = f"{COLLECTION_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"], include_in_schema=False)
async def auth_service_proxy(path: str, request: Request):
    target_url = f"{AUTH_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

@app.api_route("/exploration/{path:path}", methods=["GET", "POST", "PUT", "DELETE"], include_in_schema=False)
async def exploration_service_proxy(path: str, request: Request, token_verified: str = Depends(verify_jwt)):
    target_url = f"{EXPLORATION_SERVICE_URL}/{path}".lstrip("/")

    # Custom header for username
    headers = dict(request.headers)
    headers["X-Username"] = token_verified  # Use custom header to pass the username

    return await proxy_request(request, target_url, headers=headers)

# CUSTOM DOCS
with open("api-doc.yaml", "r") as file:
    openapi_spec = yaml.safe_load(file)

@app.get("/api-doc.yaml", include_in_schema=False)
async def get_openapi_yaml():
    return Response(content=yaml.dump(openapi_spec), media_type="application/yaml")

@app.get("/docs", include_in_schema=False)
async def custom_docs():
    return get_swagger_ui_html(openapi_url="/api-doc.yaml", title="Custom API Docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
