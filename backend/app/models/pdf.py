from sqlalchemy import Column, Integer, String
from app.db.database import Base

class PDF(Base):

    __tablename__ = "pdfs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(String)

    content = Column(String)