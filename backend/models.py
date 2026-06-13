from sqlalchemy import Column, Integer, String
from database import Base

class Fisherman(Base):
    __tablename__ = "fishermen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    boat_name = Column(String)
    phone = Column(String)