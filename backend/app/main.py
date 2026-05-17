from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth_routes import router as auth_router
from app.models.workspace import Workspace
from app.models.pdf_document import PDFDocument
from app.models.chat import Chat
from app.models.message import Message
app = FastAPI(title="Knowledge System API")

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routes
app.include_router(router)


@app.get("/")
def root():
    return {"message": "API is Running"}

app.include_router(auth_router)