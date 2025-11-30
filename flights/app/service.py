import requests
from bs4 import BeautifulSoup

KAYAK_URL = "https://www.kayak.com/flights/{origin}-{destination}/{date}?sort=bestflight_a"

def search_flights(origin: str, destination: str, depart_date: str):
    url = KAYAK_URL.format(
        origin=origin,
        destination=destination,
        date=depart_date
    )

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        html = requests.get(url, headers=headers, timeout=10).text
        soup = BeautifulSoup(html, "lxml")

        flights = []

        # NEW selectors
        cards = soup.select(".nrc6-wrapper")

        if not cards:
            return {"flights": [], "count": 0}

        for card in cards[:10]:
            
            airline = card.select_one(".c_cgF-airline-name")
            price = card.select_one(".c_cgF-price")
            duration = card.select_one(".c_cgF-duration")

            flights.append({
                "airline": airline.get_text(strip=True) if airline else "N/A",
                "price": price.get_text(strip=True) if price else "N/A",
                "duration": duration.get_text(strip=True) if duration else "N/A"
            })

        return {"flights": flights, "count": len(flights)}

    except Exception as e:
        return {"error": str(e)}
