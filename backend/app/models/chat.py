from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from app.db.database import Base

class Chat(Base):

    __tablename__ = "chats"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(String)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id")
    )