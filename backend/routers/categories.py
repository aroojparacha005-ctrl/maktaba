from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Language, Category
from schemas import LanguageCreate, LanguageOut, CategoryCreate, CategoryOut

router = APIRouter()


# ─── Languages ───────────────────────────────────────────────
@router.get("/languages", response_model=list[LanguageOut])
async def list_languages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Language).order_by(Language.name))
    return result.scalars().all()


@router.post("/languages", response_model=LanguageOut, status_code=201)
async def create_language(payload: LanguageCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Language).where(Language.name == payload.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Language already exists")
    lang = Language(name=payload.name)
    db.add(lang)
    await db.commit()
    await db.refresh(lang)
    return lang


@router.delete("/languages/{lang_id}", status_code=204)
async def delete_language(lang_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Language).where(Language.id == lang_id))
    lang = result.scalar_one_or_none()
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")
    await db.delete(lang)
    await db.commit()


# ─── Sub-categories ──────────────────────────────────────────
@router.get("/", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


@router.post("/", response_model=CategoryOut, status_code=201)
async def create_category(payload: CategoryCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Category).where(Category.name == payload.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Category already exists")
    cat = Category(name=payload.name)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=204)
async def delete_category(cat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    await db.commit()
