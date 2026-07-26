from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth_routes, meeting_routes, task_routes, user_routes, admin_routes
from app.services.scheduler_service import start_background_email_scheduler

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise AI Meeting & Follow-Up Agent REST API powered by FastAPI, SQLite, and Google Gemini.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Startup event to start background email scheduler
@app.on_event("startup")
def startup_event():
    start_background_email_scheduler()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(meeting_routes.router, prefix=settings.API_V1_STR)
app.include_router(task_routes.router, prefix=settings.API_V1_STR)
app.include_router(user_routes.router, prefix=settings.API_V1_STR)
app.include_router(admin_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "gemini_status": "configured" if bool(settings.GEMINI_API_KEY) else "fallback_mode"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
