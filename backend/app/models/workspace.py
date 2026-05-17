from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.db.database import Base

class Workspace(Base):

    __tablename__ = "workspaces"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="workspaces"
    )