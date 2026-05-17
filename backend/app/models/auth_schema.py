from pydantic import BaseModel

class SignupSchema(BaseModel):

    username: str
    email: str
    password: str

class LoginSchema(BaseModel):

    email: str
    password: str