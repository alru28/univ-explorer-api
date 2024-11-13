from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient, ReturnDocument

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
    gravity: Optional[float] = None
    temperature: Optional[float] = None
    civilization: Optional[str] = "None"
    main_event: Optional[str] = "None"
    demonym: Optional[str] = "None"
    representative: Optional[str] = "None"
    username: Optional[str] = None

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
            if "gemma2:2b-instruct-q4_K_M" not in models:
                pull_response = requests.post(f"{OLLAMA_URL}/api/pull", json={"name": "gemma2:2b-instruct-q4_K_M"})
                if pull_response.status_code != 200:
                    raise Exception("Failed to pull gemma2 model")
        else:
            raise Exception("Failed to retrieve models from Ollama")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions for randomization of the generated planets
def select_adjective():
    adjectives = [
        "mystical", "ancient", "futuristic", "exotic", "celestial", "enigmatic",
        "ethereal", "serene", "volatile", "luminous", "magnificent", "mysterious",
        "vibrant", "serene", "dazzling", "radiant", "majestic", "primordial",
        "nebulous", "glorious", "splendid", "ethereal", "transient", "timeless",
        "distant", "hidden", "hidden", "sacred", "ancient", "distant", "forgotten",
        "unseen", "hidden", "mysterious", "legendary", "mythical", "arcane",
        "mystic", "enchanting", "bewildering", "captivating", "alluring", "charming",
        "enigmatic", "puzzling", "intriguing", "fascinating", "enveloping", "shrouded"
    ]
    return random.choice(adjectives), random.choice(adjectives)

# FastAPI Startup Event
@app.on_event("startup")
async def startup_event():
    check_and_pull_model()
    
    

# FastAPI Routes

@app.get("/planets/all", response_model=List[PlanetDetail])
async def get_all_planets():
    planets = list(planet_collection.find())
    if not planets:
        raise HTTPException(status_code=404, detail="No planets found")
    return [PlanetDetail(**planet) for planet in planets]

@app.get("/planets/{planet_id}", response_model=PlanetDetail)
async def get_planet(planet_id: str):
    try:
        object_id = ObjectId(planet_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid planet ID format")
    
    planet = planet_collection.find_one({"_id": planet_id})
    if not planet:
        raise HTTPException(status_code=404, detail="Planet not found")    
    
    return PlanetDetail(**planet)

@app.get("/latest", response_model=List[PlanetBase])
async def get_latest():
    planets = list(planet_collection.find().sort("_id", -1).limit(10))
    return [PlanetBase(**planet) for planet in planets]

@app.get("/planets/user/{username}", response_model=List[PlanetDetail])
async def get_planets_by_user(username: str):
    planets = list(planet_collection.find({"username": username}))
    if not planets:
        raise HTTPException(status_code=404, detail="No planets found for this user")
    return [PlanetDetail(**planet) for planet in planets]

@app.put("/planets/{planet_id}", response_model=PlanetDetail)
async def update_planet(planet_id: str, planet: PlanetDetail):
    try:
        object_id = ObjectId(planet_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid planet ID format")

    # Get id out to avoid error
    planet_data = {k: v for k, v in planet.dict(by_alias=True).items() if v is not None and k != "_id"}
    

    result = planet_collection.find_one_and_update(
        {"_id": planet_id},
        {"$set": planet_data},
        return_document=ReturnDocument.AFTER
    )

    if not result:
        raise HTTPException(status_code=404, detail="Planet not found")

    return PlanetDetail(**result)

@app.post("/explore", response_model=PlanetDetail, status_code=201)
async def explore(username: Optional[str] = Header(None, alias="X-Username")):
    
    adj_1, adj_2 = select_adjective()

    seed_value = random.randint(1, 1000000)
    
    prompt = (
        f"You are an AI tasked with creating a {adj_1} and {adj_2} planet for exploration purposes. "
        f"Seed value: {seed_value}. Each generated planet should be distinct, with attributes that vary significantly based on the previous seed I sent you and the adjectives of the planet. "
        "Provide the following details in JSON format: name (make it unique and imaginative), color_base (a unique hex color code), color_extra (another unique hex color code different from color_base), mass (a random value in kg), radius (a random value in km), gravity (a random value in m/s^2), temperature (a random value in Celsius), civilization (a distinct type of civilization, such as advanced aliens or prehistoric beings), main_event (the whole description in 100 words of an interesting historical or scientific event unique to the planet), demonym (a unique name for inhabitants), and representative (a fictional unique name for the representative). "
        "Don't include the units in the numeric variables (mass, radius, gravity, temperature), just the numbers. Provide only text in the text variables (name, civilization, main_event, demonym, representative). Don't use scientific notation, put the whole number. "
        "Make sure that the different parameters make sense between them, such as the gravity with the mass or the name with the civilization or denonym."
        "Ensure that the response can be directly parsed into a JSON object, and the response only contains that JSON, nothing else. Provide it in exactly and strictly this format without new lines, filling in the X: "
        "{\"name\":\"X\", \"color_base\":\"X\", \"color_extra\":\"X\", \"mass\":\"X\", \"radius\":\"X\", \"gravity\":\"X\", \"temperature\":\"X\", \"civilization\":\"X\", \"main_event\":\"X\", \"demonym\":\"X\", \"representative\":\"X\"}"
    )

    # Request to container
    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": "gemma2:2b-instruct-q4_K_M", "prompt": prompt, "format": "json", "stream": False, "options": {
            "seed": seed_value, "temperature":2}},
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to generate planet data")

    try:
        json_data = json.loads(response.text)
        
        print("JSON Data: ", json_data)
        
        planet_data = json.loads(json_data['response'])
        
        print("Planet Data: ", planet_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid response from LLM")
    
    planet_data['username'] = username

    planet = PlanetDetail(**planet_data)

    # Store the planet in MongoDB
    planet_data = planet.dict(by_alias=True)
    result = planet_collection.insert_one(planet_data)
    planet_data["_id"] = result.inserted_id

    return PlanetDetail(**planet_data)

# DEBUG
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")