from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, exists
from sqlalchemy.orm import selectinload
from database import get_db
from models import Book, Issuance
from schemas import BookCreate, BookUpdate, BookOut
from datetime import date
from typing import Optional
from utils import compute_progress

router = APIRouter()


def book_to_out(book: Book, issued: bool) -> BookOut:
    return BookOut(
        id=book.id,
        title=book.title,
        language_id=book.language_id,
        category_id=book.category_id,
        language=book.language_rel.name if book.language_rel else "",
        category=book.category_rel.name if book.category_rel else "",
        is_issued=issued,
        created_at=book.created_at,
    )


@router.get("/", response_model=list[BookOut])
async def list_books(
    search: Optional[str] = Query(None),
    language_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    is_issued: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Book)
        .options(selectinload(Book.language_rel), selectinload(Book.category_rel))
        .order_by(Book.created_at.desc())
    )
    if language_id:
        stmt = stmt.where(Book.language_id == language_id)
    if category_id:
        stmt = stmt.where(Book.category_id == category_id)
    if search:
        stmt = stmt.where(Book.title.ilike(f"%{search}%"))

    result = await db.execute(stmt)
    books = result.scalars().all()

    # get currently issued book ids
    issued_stmt = select(Issuance.book_id).where(Issuance.returned_at.is_(None))
    issued_result = await db.execute(issued_stmt)
    issued_ids = set(issued_result.scalars().all())

    out = [book_to_out(b, b.id in issued_ids) for b in books]
    if is_issued is not None:
        out = [b for b in out if b.is_issued == is_issued]
    return out


@router.get("/{book_id}", response_model=BookOut)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.language_rel), selectinload(Book.category_rel))
        .where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    issued_stmt = select(exists().where(
        (Issuance.book_id == book_id) & (Issuance.returned_at.is_(None))
    ))
    is_issued = (await db.execute(issued_stmt)).scalar()
    return book_to_out(book, is_issued)


@router.post("/", response_model=BookOut, status_code=201)
async def create_book(payload: BookCreate, db: AsyncSession = Depends(get_db)):
    book = Book(**payload.model_dump())
    db.add(book)
    await db.commit()
    await db.refresh(book)
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.language_rel), selectinload(Book.category_rel))
        .where(Book.id == book.id)
    )
    book = result.scalar_one()
    return book_to_out(book, False)


@router.patch("/{book_id}", response_model=BookOut)
async def update_book(book_id: int, payload: BookUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.language_rel), selectinload(Book.category_rel))
        .where(Book.id == book_id)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(book, k, v)
    await db.commit()
    await db.refresh(book)
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.language_rel), selectinload(Book.category_rel))
        .where(Book.id == book_id)
    )
    book = result.scalar_one()
    issued_stmt = select(exists().where(
        (Issuance.book_id == book_id) & (Issuance.returned_at.is_(None))
    ))
    is_issued = (await db.execute(issued_stmt)).scalar()
    return book_to_out(book, is_issued)


@router.delete("/{book_id}", status_code=204)
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    await db.delete(book)
    await db.commit()
