from pydantic import BaseModel

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    depart_date: str
