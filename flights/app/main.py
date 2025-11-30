from fastapi import FastAPI
from pydantic import BaseModel
from .service import search_flights

app = FastAPI()

class FlightRequest(BaseModel):
    origin: str
    destination: str
    depart_date: str

@app.post("/search")
def search(request: FlightRequest):
    return search_flights(request.origin, request.destination, request.depart_date)
