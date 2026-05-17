from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True
    )

    email = Column(
        String,
        unique=True
    )
    workspaces = relationship(
    "Workspace",
    back_populates="user"
    )
    password = Column(String)