from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.db.database import Base

class PDFDocument(Base):

    __tablename__ = "pdf_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(String)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id")
    )