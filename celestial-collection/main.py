from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests

from fastapi.middleware.cors import CORSMiddleware

# GLOBAL
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["GET"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Models
class Planet(BaseModel):
    name: str
    type: str = "Planet" # Planet
    mass: Optional[float]
    radius: Optional[float]
    diameter: Optional[float]
    gravity: Optional[float]
    distanceFromEarth: Optional[float]
    temperature: Optional[float]
    civilization: Optional[str] = "None"  # Default = None
    demonym: Optional[str] = "None" # Default = None

@app.get("/planets", response_model=List[Planet])
def get_planets():
    headers = {
        "Accept": "application/sparql-results+json"
    }

    query = """
        SELECT ?planet ?planetLabel 
            (SAMPLE(?distanceFromEarth) AS ?distanceFromEarth) 
            (SAMPLE(IF(BOUND(?temperature), ?temperature, "-110")) AS ?temperature) # Handle case of Jupiter not having temperature
            (SAMPLE(?radius) AS ?radius) 
            (SAMPLE(?diameter) AS ?diameter) 
            (SAMPLE(?gravity) AS ?gravity) 
            (SAMPLE(COALESCE(?demonymEng, ?demonymOther)) AS ?demonym)  # Prioritize English demonym
            (SAMPLE(?mass) AS ?mass)  # Mass of the planet
        WHERE {
        {
            ?planet wdt:P31 wd:Q3504248 .  # Inner planet of the Solar System
        }
        UNION
        {
            ?planet wdt:P31 wd:Q30014 .  # Outer planet
        }
        OPTIONAL { ?planet wdt:P2583 ?distanceFromEarth . }  # Distance from Earth
        OPTIONAL { ?planet wdt:P2076 ?temperature . }  # Temperature
        OPTIONAL { ?planet wdt:P2120 ?radius . }  # Radius
        OPTIONAL { ?planet wdt:P2386 ?diameter . }  # Diameter
        OPTIONAL { ?planet wdt:P7015 ?gravity . }  # Surface gravity
        OPTIONAL { ?planet wdt:P2067 ?mass . }  # Mass
        OPTIONAL { ?planet wdt:P1549 ?demonymEng . FILTER (lang(?demonymEng) = "en") }  # Demonym (only in English)
        OPTIONAL { ?planet wdt:P1549 ?demonymOther . }  # Demonym (any other language)
        
        FILTER (?planet != wd:Q3542479)  # Exclude Tuxing (Mars alternative)
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        GROUP BY ?planet ?planetLabel
    """


    # Query WikiData
    response = requests.get(WIKIDATA_SPARQL_URL, params={"query": query}, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data from Wikidata")

    data = response.json()
    results = data['results']['bindings']

    planets = []

    for result in results:
        name = result['planetLabel']['value']
        mass = float(result['mass']['value']) if 'mass' in result else None
        radius = float(result['radius']['value']) if 'radius' in result else None
        diameter = float(result['diameter']['value']) if 'diameter' in result else None
        gravity = float(result['gravity']['value']) if 'gravity' in result else None
        distance_from_earth = float(result['distanceFromEarth']['value']) if 'distanceFromEarth' in result else None
        temperature = float(result['temperature']['value']) if 'temperature' in result else None
        demonym = result.get('demonym', {}).get('value', "None")

        planets.append(Planet(
            name=name,
            type="Planet",
            mass=mass,
            radius=radius,
            diameter=diameter,
            gravity=gravity,
            distanceFromEarth=distance_from_earth,
            temperature=temperature,
            civilization="Humans" if name == "Earth" else "None",
            demonym=demonym
        ))

    return planets


# DEBUG
if __name__ == "__main__":
    # Use this for debugging purposes only
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")