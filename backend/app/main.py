from fastapi import FastAPI
from app.api.routes import router
app = FastAPI(title = "Knowledge System API")

app.include_router(router)

@app.get("/")
def root():
    return {"message":"API is Running"}