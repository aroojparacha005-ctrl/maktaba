from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_tables
from routers import books, categories, issuances, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield

app = FastAPI(
    title="School Library Management System",
    description="REST API for managing school library books, issuances, and categories",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(issuances.router, prefix="/api/issuances", tags=["Issuances"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Library API is running"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
