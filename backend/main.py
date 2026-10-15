# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Database setup & table initialization
from database import engine, Base
import models.history  # Ensures ActivityLog model is registered before creation

Base.metadata.create_all(bind=engine)

# Routers
from api.routes import router
from api.document_routes import doc_router
from api.analytics_routes import analytics_router
from api.learning_routes import learning_router

app = FastAPI(
    title=os.getenv("APP_NAME", "GrammarGuard AI"),
    description="Backend API for GrammarGuard AI - Multi-Agent & RAG GEC Platform",
    version="1.0.0"
)

# CORS setup for Vite / Create-React-App
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(router)
app.include_router(doc_router)
app.include_router(analytics_router)
app.include_router(learning_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)