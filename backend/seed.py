"""
Run this once to seed the database with initial data.
Usage: python seed.py
"""
import asyncio
from database import AsyncSessionLocal, create_tables
from models import Language, Category, Book
from sqlalchemy import select


async def seed():
    await create_tables()
    async with AsyncSessionLocal() as db:
        # Seed languages
        langs = ["English", "Urdu"]
        lang_map = {}
        for name in langs:
            existing = (await db.execute(select(Language).where(Language.name == name))).scalar_one_or_none()
            if not existing:
                obj = Language(name=name)
                db.add(obj)
                await db.flush()
                lang_map[name] = obj.id
            else:
                lang_map[name] = existing.id

        # Seed categories
        cats = ["Story", "Self-help", "Islamic"]
        cat_map = {}
        for name in cats:
            existing = (await db.execute(select(Category).where(Category.name == name))).scalar_one_or_none()
            if not existing:
                obj = Category(name=name)
                db.add(obj)
                await db.flush()
                cat_map[name] = obj.id
            else:
                cat_map[name] = existing.id

        # Seed sample books
        sample_books = [
            ("Bang-e-Dara", "Urdu", "Islamic"),
            ("The Alchemist", "English", "Self-help"),
            ("Totto-Chan", "English", "Story"),
            ("Bachon ki Duniya", "Urdu", "Story"),
            ("Sapiens", "English", "Self-help"),
            ("Quran Aur Science", "Urdu", "Islamic"),
            ("Charlotte's Web", "English", "Story"),
        ]
        for title, lang, cat in sample_books:
            existing = (await db.execute(select(Book).where(Book.title == title))).scalar_one_or_none()
            if not existing:
                db.add(Book(title=title, language_id=lang_map[lang], category_id=cat_map[cat]))

        await db.commit()
        print("✅ Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
