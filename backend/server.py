from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Exercise Models
class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    isActive: bool = True

class ExerciseCreate(BaseModel):
    name: str
    description: str
    isActive: bool = True

class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None

# Workout Settings Models
class WorkoutSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workTime: int = 40  # seconds
    restTime: int = 20  # seconds
    setsPerExercise: int = 3
    circuits: int = 2
    exerciseOrder: List[str] = []  # List of exercise IDs in order
    userId: str = "default"  # For future user management
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class WorkoutSettingsCreate(BaseModel):
    workTime: Optional[int] = 40
    restTime: Optional[int] = 20
    setsPerExercise: Optional[int] = 3
    circuits: Optional[int] = 2
    exerciseOrder: Optional[List[str]] = []
    userId: Optional[str] = "default"

class WorkoutSettingsUpdate(BaseModel):
    workTime: Optional[int] = None
    restTime: Optional[int] = None
    setsPerExercise: Optional[int] = None
    circuits: Optional[int] = None
    exerciseOrder: Optional[List[str]] = None

# Workout Session Models
class WorkoutSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str = "default"
    exercises: List[Exercise]
    settings: WorkoutSettings
    startedAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: Optional[datetime] = None
    totalDuration: Optional[int] = None  # seconds
    completedSets: int = 0
    completedCircuits: int = 0
    status: str = "active"  # active, completed, abandoned

class WorkoutSessionCreate(BaseModel):
    exercises: List[Exercise]
    settings: WorkoutSettings
    userId: Optional[str] = "default"


# Basic status check routes (keep existing)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Exercise Timer API", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Exercise Management Routes
@api_router.get("/exercises", response_model=List[Exercise])
async def get_exercises():
    """Get all exercises"""
    exercises = await db.exercises.find().to_list(1000)
    if not exercises:
        # Initialize with default exercises if none exist
        default_exercises = [
            {"name": "Push-ups", "description": "Standard push-ups", "isActive": True},
            {"name": "Squats", "description": "Bodyweight squats", "isActive": True},
            {"name": "Jumping Jacks", "description": "Full body cardio", "isActive": True},
            {"name": "Mountain Climbers", "description": "Core and cardio", "isActive": True}
        ]
        
        exercise_objects = []
        for ex_data in default_exercises:
            exercise = Exercise(**ex_data)
            await db.exercises.insert_one(exercise.dict())
            exercise_objects.append(exercise)
        
        return exercise_objects
    
    return [Exercise(**exercise) for exercise in exercises]

@api_router.post("/exercises", response_model=Exercise)
async def create_exercise(exercise_data: ExerciseCreate):
    """Create a new exercise"""
    exercise = Exercise(**exercise_data.dict())
    await db.exercises.insert_one(exercise.dict())
    return exercise

@api_router.put("/exercises/{exercise_id}", response_model=Exercise)
async def update_exercise(exercise_id: str, exercise_update: ExerciseUpdate):
    """Update an existing exercise"""
    update_data = {k: v for k, v in exercise_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.exercises.update_one(
        {"id": exercise_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    updated_exercise = await db.exercises.find_one({"id": exercise_id})
    return Exercise(**updated_exercise)

@api_router.delete("/exercises/{exercise_id}")
async def delete_exercise(exercise_id: str):
    """Delete an exercise"""
    result = await db.exercises.delete_one({"id": exercise_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    return {"message": "Exercise deleted successfully"}


# Workout Settings Routes
@api_router.get("/settings", response_model=WorkoutSettings)
async def get_workout_settings(user_id: str = "default"):
    """Get workout settings for a user"""
    settings = await db.workout_settings.find_one({"userId": user_id})
    
    if not settings:
        # Create default settings if none exist
        default_settings = WorkoutSettings(userId=user_id)
        await db.workout_settings.insert_one(default_settings.dict())
        return default_settings
    
    return WorkoutSettings(**settings)

@api_router.post("/settings", response_model=WorkoutSettings)
async def create_or_update_workout_settings(settings_data: WorkoutSettingsCreate):
    """Create or update workout settings"""
    user_id = settings_data.userId or "default"
    
    # Check if settings already exist for this user
    existing_settings = await db.workout_settings.find_one({"userId": user_id})
    
    if existing_settings:
        # Update existing settings
        update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        await db.workout_settings.update_one(
            {"userId": user_id},
            {"$set": update_data}
        )
        
        updated_settings = await db.workout_settings.find_one({"userId": user_id})
        return WorkoutSettings(**updated_settings)
    else:
        # Create new settings
        settings = WorkoutSettings(**settings_data.dict())
        await db.workout_settings.insert_one(settings.dict())
        return settings

@api_router.put("/settings", response_model=WorkoutSettings)
async def update_workout_settings(settings_update: WorkoutSettingsUpdate, user_id: str = "default"):
    """Update workout settings"""
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.workout_settings.update_one(
        {"userId": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    updated_settings = await db.workout_settings.find_one({"userId": user_id})
    return WorkoutSettings(**updated_settings)


# Workout Session Routes
@api_router.post("/sessions", response_model=WorkoutSession)
async def create_workout_session(session_data: WorkoutSessionCreate):
    """Create a new workout session"""
    session = WorkoutSession(**session_data.dict())
    await db.workout_sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions", response_model=List[WorkoutSession])
async def get_workout_sessions(user_id: str = "default", limit: int = 10):
    """Get workout sessions for a user"""
    sessions = await db.workout_sessions.find(
        {"userId": user_id}
    ).sort("startedAt", -1).limit(limit).to_list(limit)
    
    return [WorkoutSession(**session) for session in sessions]

@api_router.put("/sessions/{session_id}/complete")
async def complete_workout_session(session_id: str, completed_sets: int, completed_circuits: int):
    """Mark a workout session as completed"""
    update_data = {
        "status": "completed",
        "completedAt": datetime.utcnow(),
        "completedSets": completed_sets,
        "completedCircuits": completed_circuits
    }
    
    # Calculate total duration
    session = await db.workout_sessions.find_one({"id": session_id})
    if session:
        start_time = session.get("startedAt")
        if start_time:
            duration = (datetime.utcnow() - start_time).total_seconds()
            update_data["totalDuration"] = int(duration)
    
    result = await db.workout_sessions.update_one(
        {"id": session_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session completed successfully"}


# Statistics Routes
@api_router.get("/stats")
async def get_workout_stats(user_id: str = "default"):
    """Get workout statistics for a user"""
    pipeline = [
        {"$match": {"userId": user_id, "status": "completed"}},
        {"$group": {
            "_id": None,
            "totalSessions": {"$sum": 1},
            "totalDuration": {"$sum": "$totalDuration"},
            "avgDuration": {"$avg": "$totalDuration"},
            "totalSets": {"$sum": "$completedSets"},
            "totalCircuits": {"$sum": "$completedCircuits"}
        }}
    ]
    
    result = await db.workout_sessions.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "totalSessions": 0,
            "totalDuration": 0,
            "avgDuration": 0,
            "totalSets": 0,
            "totalCircuits": 0
        }
    
    stats = result[0]
    stats.pop("_id", None)  # Remove the _id field
    return stats


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()