from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient

from typing import List, Optional
import os
import random
import requests
import json

# GLOBAL
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongo_user:mongo_pass@mongodb:27017/exploration_db")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

# Initialize FastAPI app
app = FastAPI(title="Exploration Service API", openapi_url="/openapi.json")

# MongoDB Connection Setup
client = MongoClient(MONGODB_URL)
db = client["exploration_db"]
planet_collection = db["planets"]

# Pydantic Models with MongoDB-compatible ID
class PlanetBase(BaseModel):
    name: str
    color_base: Optional[str] = None
    color_extra: Optional[str] = None
    image_url: Optional[str] = None  # Field for the image URL

class PlanetDetail(PlanetBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")  # MongoDB-compatible ID
    mass: Optional[float] = None
    radius: Optional[float] = None
    diameter: Optional[float] = None
    gravity: Optional[float] = None
    temperature: Optional[float] = None
    civilization: Optional[str] = "None"
    main_event: Optional[str] = "None"
    demonym: Optional[str] = "None"
    discoverer: Optional[str] = "None"

    class Config:
        # Allows `_id` to be populated by MongoDB
        populate_by_name = True
        json_encoders = {ObjectId: str}
          
        
# Function to check if Ollama model is available and pull if necessary
def check_and_pull_model():
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags")
        if response.status_code == 200:
            models = response.json().get("models", [])
            if "llama3.2" not in models:
                pull_response = requests.post(f"{OLLAMA_URL}/api/pull", json={"name": "llama3.2"})
                if pull_response.status_code != 200:
                    raise Exception("Failed to pull llama3.2 model")
        else:
            raise Exception("Failed to retrieve models from Ollama")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FastAPI Startup Event
@app.on_event("startup")
async def startup_event():
    check_and_pull_model()
    
    

# FastAPI Routes

@app.get("/planets/all", response_model=List[PlanetDetail])
async def get_all_planets():
    planets = list(planet_collection.find())
    return [PlanetDetail(**planet) for planet in planets]

@app.get("/planets/{planet_id}", response_model=PlanetDetail)
async def get_planet(planet_id: str):
    try:
        object_id = ObjectId(planet_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid planet ID format")

    # Debugging print
    print(f"Querying planet with ID: {object_id}")
    
    planet = planet_collection.find_one({"_id": planet_id})
    if not planet:
        raise HTTPException(status_code=404, detail="Planet not found")
    
    # Debugging print to verify the found document
    print(f"Found planet: {planet}")
    
    return PlanetDetail(**planet)

@app.get("/latest", response_model=List[PlanetBase])
async def get_latest():
    planets = list(planet_collection.find().sort("_id", -1).limit(10))
    return [PlanetBase(**planet) for planet in planets]

@app.post("/planets/", response_model=PlanetDetail)
async def create_planet(planet: PlanetDetail):
    planet_data = planet.dict(by_alias=True)  # Use alias to keep `_id`
    result = planet_collection.insert_one(planet_data)
    planet_data["_id"] = result.inserted_id
    return PlanetDetail(**planet_data)

@app.post("/explore", response_model=PlanetDetail)
async def explore():
    
    adjectives = ["mystical", "ancient", "futuristic", "exotic", "celestial", "enigmatic"]
    random_adjective = random.choice(adjectives)

    seed_value = random.randint(1, 1000000)
    
    prompt = (
        f"You are an AI tasked with creating a {random_adjective} and unique fictional planet for exploration purposes. "
        f"Seed value: {seed_value}. Each generated planet should be distinct, with attributes that vary significantly from previous ones. "
        "Provide the following details in JSON format: name (make it unique and imaginative), color_base (a unique hex color code), color_extra (another unique hex color code different from color_base), mass (a random value in kg), radius (a random value in km), diameter (a random value in km), gravity (a random value in m/s^2), temperature (a random value in Celsius), civilization (a distinct type of civilization, such as advanced aliens or prehistoric beings), main_event (an interesting historical or scientific event unique to the planet), demonym (a unique name for inhabitants), and discoverer (a fictional unique name for the discoverer). "
        "Don't include the units in the numeric variables (mass, radius, diameter, gravity, temperature), just the numbers. Provide only text in the text variables (name, civilization, main_event, demonym, discoverer). Don't use scientific notation, put the whole number. "
        "Ensure that the response can be directly parsed into a JSON object, and the response only contains that JSON, nothing else. Provide it in exactly and strictly this format without new lines, filling in the X: "
        "{\"name\":\"X\", \"color_base\":\"X\", \"color_extra\":\"X\", \"mass\":\"X\", \"radius\":\"X\", \"diameter\":\"X\", \"gravity\":\"X\", \"temperature\":\"X\", \"civilization\":\"X\", \"main_event\":\"X\", \"demonym\":\"X\", \"discoverer\":\"X\"}"
    )

    # Make a request to the Ollama container
    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": "llama3.2", "prompt": prompt, "format": "json", "stream": False, "options": {
            "seed": seed_value, "temperature":1.2}},
        headers={"Content-Type": "application/json"}
    )
    
    print("Status code:", response.status_code)
    print("Response text:", response.text)  # To see the raw response

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to generate planet data")

    # Parse the response from Ollama
    try:
        json_data = json.loads(response.text)
        
        print("JSON Data: ", json_data)
        
        planet_data = json.loads(json_data['response'])
        
        print("Planet Data: ", planet_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid response from LLM")

    # Create a PlanetDetail object from the LLM response
    planet = PlanetDetail(**planet_data)

    # Store the planet in MongoDB
    planet_data = planet.dict(by_alias=True)
    result = planet_collection.insert_one(planet_data)
    planet_data["_id"] = result.inserted_id
    
    print(f"Inserted planet ID: {result.inserted_id}")

    return PlanetDetail(**planet_data)

# DEBUG
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")