from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from app.db.database import Base

class Message(Base):

    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    role = Column(String)

    content = Column(String)

    chat_id = Column(
        Integer,
        ForeignKey("chats.id")
    )