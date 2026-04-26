from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional


# ─── Language ───────────────────────────────────────────────
class LanguageBase(BaseModel):
    name: str

class LanguageCreate(LanguageBase):
    pass

class LanguageOut(LanguageBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ─── Category ───────────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ─── Book ────────────────────────────────────────────────────
class BookBase(BaseModel):
    title: str
    language_id: int
    category_id: int

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    language_id: Optional[int] = None
    category_id: Optional[int] = None

class BookOut(BaseModel):
    id: int
    title: str
    language_id: int
    category_id: int
    language: str
    category: str
    is_issued: bool = False
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ─── Issuance ────────────────────────────────────────────────
class IssuanceBase(BaseModel):
    book_id: int
    student_name: str
    student_class: str
    roll_no: str
    issue_date: date
    due_date: date

    @field_validator("due_date")
    @classmethod
    def due_after_issue(cls, v, info):
        if "issue_date" in info.data and v <= info.data["issue_date"]:
            raise ValueError("due_date must be after issue_date")
        return v

class IssuanceCreate(IssuanceBase):
    pass

class IssuanceOut(BaseModel):
    id: int
    book_id: int
    book_title: str
    book_language: str
    book_category: str
    student_name: str
    student_class: str
    roll_no: str
    issue_date: date
    due_date: date
    returned_at: Optional[datetime] = None
    days_remaining: Optional[int] = None
    progress_pct: Optional[int] = None
    progress_color: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ─── Dashboard ───────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_books: int
    issued_books: int
    available_books: int
    overdue_books: int
    urgent_issuances: list[IssuanceOut]
