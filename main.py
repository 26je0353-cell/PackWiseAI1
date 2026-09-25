from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(title="PackWise AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MATERIALS = [
    {
        "id": "pet-al-pe",
        "name": "PET / Aluminium / PE",
        "short": "PET/Al/PE",
        "applications": ["Potato chips", "Coffee", "High-barrier snack pouches"],
        "oxygen": 5, "moisture": 5, "light": 5, "strength": 4,
        "heat": 4, "cost": 3, "sustainability": 2,
        "description": "High-barrier multilayer structure commonly used where strong protection from oxygen, moisture and light is required.",
        "advantages": ["Excellent barrier performance", "Good printability and strength", "Suitable for long shelf-life applications"],
        "limitations": ["Multilayer construction can complicate recycling", "Higher material complexity"]
    },
    {
        "id": "bopp-metpet-pe",
        "name": "BOPP / MetPET / PE",
        "short": "BOPP/MetPET/PE",
        "applications": ["Snack foods", "Biscuits", "Confectionery"],
        "oxygen": 5, "moisture": 5, "light": 4, "strength": 4,
        "heat": 4, "cost": 4, "sustainability": 2,
        "description": "Flexible multilayer film offering strong moisture and oxygen protection with good mechanical performance.",
        "advantages": ["Strong barrier", "Good appearance and machinability", "Useful for flexible snack packaging"],
        "limitations": ["Multilayer structure", "Recycling depends on local systems"]
    },
    {
        "id": "pet-pe",
        "name": "PET / PE",
        "short": "PET/PE",
        "applications": ["Dry foods", "Powders", "General flexible food pouches"],
        "oxygen": 3, "moisture": 4, "light": 3, "strength": 4,
        "heat": 4, "cost": 4, "sustainability": 3,
        "description": "A common flexible laminate balancing barrier performance, strength and cost.",
        "advantages": ["Balanced performance", "Good mechanical properties", "Broad food-packaging use"],
        "limitations": ["Lower barrier than foil-based structures", "Multilayer recycling challenges"]
    },
    {
        "id": "hdpe",
        "name": "HDPE",
        "short": "HDPE",
        "applications": ["Milk containers", "Food bottles", "Dairy packaging"],
        "oxygen": 3, "moisture": 4, "light": 3, "strength": 5,
        "heat": 3, "cost": 5, "sustainability": 4,
        "description": "Rigid plastic with good moisture resistance and mechanical strength.",
        "advantages": ["Good rigidity", "Good moisture resistance", "Widely used food-contact format"],
        "limitations": ["Moderate oxygen barrier", "Light protection depends on formulation/container design"]
    },
    {
        "id": "glass",
        "name": "Glass",
        "short": "Glass",
        "applications": ["Jam jars", "Sauce bottles", "Pickles and beverages"],
        "oxygen": 5, "moisture": 5, "light": 4, "strength": 3,
        "heat": 5, "cost": 3, "sustainability": 5,
        "description": "Rigid packaging material with excellent barrier properties and strong chemical inertness.",
        "advantages": ["Excellent barrier", "Chemically inert", "Highly recyclable where collection exists"],
        "limitations": ["Heavy", "Breakable", "Transport energy can be significant"]
    },
    {
        "id": "paper-pe",
        "name": "Paper / PE",
        "short": "Paper/PE",
        "applications": ["Bakery products", "Dry foods", "Takeaway food packs"],
        "oxygen": 2, "moisture": 4, "light": 3, "strength": 3,
        "heat": 3, "cost": 5, "sustainability": 4,
        "description": "Paper-based structure with a PE layer for improved moisture resistance.",
        "advantages": ["Paper-based appearance", "Good moisture improvement over plain paper", "Cost-effective"],
        "limitations": ["Barrier depends strongly on structure", "Composite layers can affect recycling"]
    },
]

FOODS = [
    {"name": "Potato Chips", "category": "Snack", "moisture": 5, "oxygen": 5, "light": 4, "fat": 5, "temp": 25, "rh": 60, "shelf": 6},
    {"name": "Biscuits", "category": "Bakery", "moisture": 4, "oxygen": 4, "light": 3, "fat": 4, "temp": 25, "rh": 60, "shelf": 6},
    {"name": "Milk", "category": "Dairy", "moisture": 1, "oxygen": 3, "light": 5, "fat": 3, "temp": 4, "rh": 70, "shelf": 1},
    {"name": "Jam", "category": "Processed", "moisture": 1, "oxygen": 3, "light": 3, "fat": 1, "temp": 25, "rh": 60, "shelf": 12},
    {"name": "Coffee", "category": "Beverage", "moisture": 5, "oxygen": 5, "light": 5, "fat": 2, "temp": 25, "rh": 60, "shelf": 12},
    {"name": "Rice", "category": "Grain", "moisture": 5, "oxygen": 2, "light": 2, "fat": 1, "temp": 25, "rh": 60, "shelf": 12},
]

class RecommendationRequest(BaseModel):
    food: str = "Potato Chips"
    category: str = "Snack"
    moisture_sensitivity: int = Field(3, ge=1, le=5)
    oxygen_sensitivity: int = Field(3, ge=1, le=5)
    light_sensitivity: int = Field(3, ge=1, le=5)
    fat_content: int = Field(3, ge=1, le=5)
    temperature: float = 25
    humidity: float = Field(60, ge=0, le=100)
    shelf_life: float = Field(6, ge=0)
    cost_priority: int = Field(3, ge=1, le=5)
    sustainability_priority: int = Field(3, ge=1, le=5)

def score_material(m, r):
    # Transparent prototype scoring. Weights intentionally depend on user priorities.
    base = (
        0.28 * (m["moisture"] * r.moisture_sensitivity / 5) +
        0.28 * (m["oxygen"] * r.oxygen_sensitivity / 5) +
        0.14 * (m["light"] * r.light_sensitivity / 5) +
        0.10 * (m["strength"] / 5) +
        0.10 * (m["cost"] * r.cost_priority / 5) +
        0.10 * (m["sustainability"] * r.sustainability_priority / 5)
    )
    # Longer shelf-life makes stronger barrier structures relatively more relevant.
    shelf_bonus = min(r.shelf_life / 12, 1) * ((m["oxygen"] + m["moisture"] + m["light"]) / 15) * 0.05
    score = min(99, round((base + shelf_bonus) * 100))
    reasons = []
    if r.moisture_sensitivity >= 4 and m["moisture"] >= 4: reasons.append("Strong moisture-barrier fit")
    if r.oxygen_sensitivity >= 4 and m["oxygen"] >= 4: reasons.append("Strong oxygen-barrier fit")
    if r.light_sensitivity >= 4 and m["light"] >= 4: reasons.append("Good light protection")
    if r.cost_priority >= 4 and m["cost"] >= 4: reasons.append("Better fit for cost priority")
    if r.sustainability_priority >= 4 and m["sustainability"] >= 4: reasons.append("Better fit for sustainability priority")
    if not reasons: reasons.append("Balanced match across the selected requirements")
    return score, reasons

@app.get("/")
def root():
    return {"message": "PackWise AI API is running"}

@app.get("/materials")
def materials():
    return MATERIALS

@app.get("/foods")
def foods():
    return FOODS

@app.get("/materials/{material_id}")
def material(material_id: str):
    return next((m for m in MATERIALS if m["id"] == material_id), None)

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    ranked = []
    for m in MATERIALS:
        score, reasons = score_material(m, req)
        ranked.append({
            "material_id": m["id"],
            "material_name": m["name"],
            "short_name": m["short"],
            "compatibility_score": score,
            "reasons": reasons,
            "applications": m["applications"],
            "properties": {
                "oxygen_barrier": m["oxygen"],
                "moisture_barrier": m["moisture"],
                "light_barrier": m["light"],
                "mechanical_strength": m["strength"],
                "heat_resistance": m["heat"],
                "cost": m["cost"],
                "sustainability": m["sustainability"]
            },
            "advantages": m["advantages"],
            "limitations": m["limitations"],
            "description": m["description"]
        })
    ranked.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return {"food": req.food, "recommendations": ranked[:3]}

@app.post("/compare")
def compare(material_ids: List[str]):
    return [m for m in MATERIALS if m["id"] in material_ids]
