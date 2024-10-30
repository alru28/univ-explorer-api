from fastapi import FastAPI, Request, HTTPException, Response, Depends
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
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=500, detail="Authentication service error")

# Proxy
async def proxy_request(request: Request, target_url: str):
    method = request.method
    print(target_url)
    headers = dict(request.headers)
    content = await request.body()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(method, target_url, headers=headers, content=content)
            return Response(content=response.content, status_code=response.status_code, headers=response.headers)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=500, detail=str(exc))


# GATEWAY APP

app = FastAPI(title="UnivExplorer API", openapi_url="/openapi.json")

@app.api_route("/collection/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def collection_service_proxy(path: str, request: Request, token_verified: bool = Depends(verify_jwt)):
    target_url = f"{COLLECTION_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

@app.api_route("/user/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_service_proxy(path: str, request: Request):
    target_url = f"{AUTH_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

@app.api_route("/explore/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def exploration_service_proxy(path: str, request: Request):
    target_url = f"{EXPLORATION_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
