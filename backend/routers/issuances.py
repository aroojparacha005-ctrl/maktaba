from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from sqlalchemy.orm import selectinload
from database import get_db
from models import Book, Issuance
from schemas import IssuanceCreate, IssuanceOut
from utils import compute_progress
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()


def issuance_to_out(iss: Issuance) -> IssuanceOut:
    days_remaining, pct, color = compute_progress(iss.issue_date, iss.due_date)
    return IssuanceOut(
        id=iss.id,
        book_id=iss.book_id,
        book_title=iss.book.title if iss.book else "",
        book_language=iss.book.language_rel.name if iss.book and iss.book.language_rel else "",
        book_category=iss.book.category_rel.name if iss.book and iss.book.category_rel else "",
        student_name=iss.student_name,
        student_class=iss.student_class,
        roll_no=iss.roll_no,
        issue_date=iss.issue_date,
        due_date=iss.due_date,
        returned_at=iss.returned_at,
        days_remaining=days_remaining,
        progress_pct=pct,
        progress_color=color,
        created_at=iss.created_at,
    )


@router.get("/", response_model=list[IssuanceOut])
async def list_issuances(
    active_only: bool = Query(True, description="Only show unreturned books"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .order_by(Issuance.due_date.asc())
    )
    if active_only:
        stmt = stmt.where(Issuance.returned_at.is_(None))
    if search:
        stmt = stmt.where(
            Issuance.student_name.ilike(f"%{search}%")
            | Issuance.roll_no.ilike(f"%{search}%")
        )
    result = await db.execute(stmt)
    return [issuance_to_out(i) for i in result.scalars().all()]


@router.get("/{issuance_id}", response_model=IssuanceOut)
async def get_issuance(issuance_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .where(Issuance.id == issuance_id)
    )
    iss = result.scalar_one_or_none()
    if not iss:
        raise HTTPException(status_code=404, detail="Issuance not found")
    return issuance_to_out(iss)


@router.post("/", response_model=IssuanceOut, status_code=201)
async def create_issuance(payload: IssuanceCreate, db: AsyncSession = Depends(get_db)):
    # check book exists
    book = (await db.execute(select(Book).where(Book.id == payload.book_id))).scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # check not already issued
    already = (await db.execute(
        select(exists().where(
            (Issuance.book_id == payload.book_id) & (Issuance.returned_at.is_(None))
        ))
    )).scalar()
    if already:
        raise HTTPException(status_code=409, detail="Book is already issued and not yet returned")

    iss = Issuance(**payload.model_dump())
    db.add(iss)
    await db.commit()
    await db.refresh(iss)

    result = await db.execute(
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .where(Issuance.id == iss.id)
    )
    return issuance_to_out(result.scalar_one())


@router.patch("/{issuance_id}/return", response_model=IssuanceOut)
async def return_book(issuance_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .where(Issuance.id == issuance_id)
    )
    iss = result.scalar_one_or_none()
    if not iss:
        raise HTTPException(status_code=404, detail="Issuance not found")
    if iss.returned_at:
        raise HTTPException(status_code=409, detail="Book already returned")
    iss.returned_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(iss)
    result = await db.execute(
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .where(Issuance.id == issuance_id)
    )
    return issuance_to_out(result.scalar_one())


@router.delete("/{issuance_id}", status_code=204)
async def delete_issuance(issuance_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Issuance).where(Issuance.id == issuance_id))
    iss = result.scalar_one_or_none()
    if not iss:
        raise HTTPException(status_code=404, detail="Issuance not found")
    await db.delete(iss)
    await db.commit()
