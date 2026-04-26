from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
from models import Book, Issuance
from schemas import DashboardStats, IssuanceOut
from utils import compute_progress
from datetime import date
from routers.issuances import issuance_to_out

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    today = date.today()

    total_books = (await db.execute(select(func.count(Book.id)))).scalar() or 0

    active_issuances_result = await db.execute(
        select(Issuance)
        .options(
            selectinload(Issuance.book).selectinload(Book.language_rel),
            selectinload(Issuance.book).selectinload(Book.category_rel),
        )
        .where(Issuance.returned_at.is_(None))
        .order_by(Issuance.due_date.asc())
    )
    active = active_issuances_result.scalars().all()

    issued_books = len(active)
    available_books = total_books - issued_books
    overdue_books = sum(1 for i in active if i.due_date < today)

    urgent = [i for i in active if (i.due_date - today).days <= 2]
    urgent_out = [issuance_to_out(i) for i in urgent]

    return DashboardStats(
        total_books=total_books,
        issued_books=issued_books,
        available_books=available_books,
        overdue_books=overdue_books,
        urgent_issuances=urgent_out,
    )
