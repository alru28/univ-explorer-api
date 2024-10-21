from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests

from fastapi.middleware.cors import CORSMiddleware

# GLOBAL
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"
VALID_PLANET_NAMES = ["Earth", "Mars", "Saturn", "Venus", "Mercury", "Uranus", "Neptune", "Jupiter"]

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["GET"],  # Allows GET method
    allow_headers=["*"],  # Allows all headers
)

# Models
class PlanetBase(BaseModel):
    name: str
    distanceFromEarth: Optional[float]

class PlanetDetail(PlanetBase):
    type: str = "Planet"  # Planet
    mass: Optional[float]
    radius: Optional[float]
    diameter: Optional[float]
    gravity: Optional[float]
    temperature: Optional[float]
    civilization: Optional[str] = "None"  # Default = None
    demonym: Optional[str] = "None"  # Default = None

class Moon(BaseModel):
    name: str
    radius: Optional[float]
    mass: Optional[float]
    gravity: Optional[float]
    distanceFromPlanet: Optional[float]


@app.get("/planets", response_model=List[PlanetBase])
def get_planets():
    headers = {
        "Accept": "application/sparql-results+json"
    }

    query = """
        SELECT ?planet ?planetLabel 
            (SAMPLE(?distanceFromEarth) AS ?distanceFromEarth)
        WHERE {
        {
            ?planet wdt:P31 wd:Q3504248 .
        }
        UNION
        {
            ?planet wdt:P31 wd:Q30014 .
        }
        OPTIONAL { ?planet wdt:P2583 ?distanceFromEarth . }  # Distance from Earth
        FILTER (?planet != wd:Q3542479)
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        GROUP BY ?planet ?planetLabel
    """

    # Send the SPARQL query to Wikidata
    response = requests.get(WIKIDATA_SPARQL_URL, params={"query": query}, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data from Wikidata")

    data = response.json()
    results = data['results']['bindings']

    planets = []

    for result in results:
        name = result['planetLabel']['value']
        distance_from_earth = float(result['distanceFromEarth']['value']) if 'distanceFromEarth' in result else None

        planets.append(PlanetBase(
            name=name,
            distanceFromEarth=distance_from_earth
        ))

    return planets


@app.get("/planets/{planet_name}", response_model=PlanetDetail)
def get_planet_details(planet_name: str):

    if planet_name not in VALID_PLANET_NAMES:
        raise HTTPException(status_code=400, detail=f"Planet '{planet_name}' is not a valid planet. Choose from: {', '.join(VALID_PLANET_NAMES)}")

    headers = {
        "Accept": "application/sparql-results+json"
    }

    query = f"""
        SELECT ?planet ?planetLabel 
        (SAMPLE(?distanceFromEarth) AS ?distanceFromEarth)
        (SAMPLE(IF(BOUND(?temperature), ?temperature, "-110")) AS ?temperature)
        (SAMPLE(?radius) AS ?radius)
        (SAMPLE(?diameter) AS ?diameter)
        (SAMPLE(?gravity) AS ?gravity)
        (SAMPLE(?mass) AS ?mass)
        (SAMPLE(COALESCE(?demonymEng, ?demonymOther)) AS ?demonym)
    WHERE {{
        {{
            ?planet wdt:P31 wd:Q3504248 .
        }}
        UNION
        {{
            ?planet wdt:P31 wd:Q30014 .
        }}
        ?planet rdfs:label "{planet_name}"@en .
        
        OPTIONAL {{ ?planet wdt:P2583 ?distanceFromEarth . }}
        OPTIONAL {{ ?planet wdt:P2076 ?temperature . }}
        OPTIONAL {{ ?planet wdt:P2120 ?radius . }}
        OPTIONAL {{ ?planet wdt:P2386 ?diameter . }}
        OPTIONAL {{ ?planet wdt:P7015 ?gravity . }}
        OPTIONAL {{ ?planet wdt:P2067 ?mass . }}
        OPTIONAL {{ ?planet wdt:P1549 ?demonymEng . FILTER (lang(?demonymEng) = "en") }}
        OPTIONAL {{ ?planet wdt:P1549 ?demonymOther . }}
        
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }}
    GROUP BY ?planet ?planetLabel
    """

    # Send the SPARQL query to Wikidata
    response = requests.get(WIKIDATA_SPARQL_URL, params={"query": query}, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data from Wikidata")

    data = response.json()
    results = data['results']['bindings']

    if not results:
        raise HTTPException(status_code=404, detail=f"Planet '{planet_name}' not found.")

    result = results[0]

    name = result['planetLabel']['value']
    distance_from_earth = float(result['distanceFromEarth']['value']) if 'distanceFromEarth' in result else None
    mass = float(result['mass']['value']) if 'mass' in result else None
    radius = float(result['radius']['value']) if 'radius' in result else None
    diameter = float(result['diameter']['value']) if 'diameter' in result else None
    gravity = float(result['gravity']['value']) if 'gravity' in result else None
    temperature = float(result['temperature']['value']) if 'temperature' in result else None
    demonym = result['demonym']['value']

    return PlanetDetail(
        name=name,
        distanceFromEarth=distance_from_earth,
        mass=mass,
        radius=radius,
        diameter=diameter,
        gravity=gravity,
        temperature=temperature,
        civilization="Humans" if name == "Earth" else "None",
        demonym=demonym
    )


# DEBUG
if __name__ == "__main__":
    # Use this for debugging purposes only
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")