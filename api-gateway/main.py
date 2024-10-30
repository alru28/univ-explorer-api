from fastapi import FastAPI, Request, HTTPException, Response
import httpx
import os

# MICROSERVICES
COLLECTION_SERVICE_URL = os.getenv("COLLECTION_SERVICE_URL", "http://collection-service:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:3000")

app = FastAPI(title="UnivExplorer API", openapi_url="/openapi.json")

# HTTP Client
client = httpx.AsyncClient()

@app.api_route("/collection/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def collection_service_proxy(path: str, request: Request):
    target_url = f"{COLLECTION_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_service_proxy(path: str, request: Request):
    target_url = f"{AUTH_SERVICE_URL}/{path}".lstrip("/")
    return await proxy_request(request, target_url)

async def proxy_request(request: Request, target_url: str):
    method = request.method
    print(target_url)
    headers = dict(request.headers)
    content = await request.body()

    try:
        response = await client.request(method, target_url, headers=headers, content=content)
        return Response(content=response.content, status_code=response.status_code, headers=response.headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
