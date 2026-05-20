from fastapi import APIRouter
from app.models.chat import Chat
from app.models.message import Message
from app.models.user import User
from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.models.pdf_document import PDFDocument
from app.models.pdf import PDF
from app.models.auth_schema import (
    SignupSchema,
    LoginSchema
)
from app.db.database import (
    SessionLocal,
    engine
)

from app.models.user import User

from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)



router = APIRouter()

# DATABASE SESSION

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

# SIGNUP

@router.post("/signup")
def signup(user: SignupSchema):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        return {
            "error": "User already exists"
        }

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(
            user.password
        )
    )

    db.add(new_user)

    db.commit()

    return {
        "message": "User created"
    }

# LOGIN

@router.post("/login")
def login(user: LoginSchema):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        return {
            "error": "User not found"
        }

    if not verify_password(
        user.password,
        existing_user.password
    ):

        return {
            "error": "Wrong password"
        }

    token = create_access_token({
        "sub": existing_user.email
    })

    return {
        "access_token": token
    }