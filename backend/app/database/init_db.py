"""Database initialisation: create tables and seed demo data."""

import logging
from sqlalchemy import select

from app.database.connection import engine, async_session_factory
from app.database.models import Base, GovernmentScheme

logger = logging.getLogger(__name__)

# ---------- Seed data for government schemes ----------
SEED_SCHEMES = [
    {
        "name": "PM-KISAN",
        "description": (
            "Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year "
            "to all land-holding farmer families across India in three equal instalments."
        ),
        "eligibility": (
            "All land-holding farmer families with cultivable land. Excludes institutional "
            "land holders, constitutional post holders, and high-income professionals."
        ),
        "benefits": "₹6,000 per year in three instalments of ₹2,000 each, directly transferred to bank account.",
        "application_process": (
            "Apply through the local Common Service Centre (CSC) or online at pmkisan.gov.in. "
            "Required documents: Aadhaar card, land records, bank account details."
        ),
        "category": "income_support",
        "is_active": True,
    },
    {
        "name": "PMFBY",
        "description": (
            "Pradhan Mantri Fasal Bima Yojana provides comprehensive crop insurance against "
            "non-preventable natural risks at very low premium rates."
        ),
        "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops.",
        "benefits": (
            "Crop insurance coverage at premium rates of 2% for Kharif, 1.5% for Rabi, and "
            "5% for commercial/horticultural crops. Full sum insured in case of crop loss."
        ),
        "application_process": (
            "Enrol through nearest bank branch, CSC, or insurance company agent before "
            "the cut-off date. Loanee farmers are auto-enrolled."
        ),
        "category": "insurance",
        "is_active": True,
    },
    {
        "name": "Soil Health Card Scheme",
        "description": (
            "The Soil Health Card Scheme provides farmers with a soil health card every "
            "two years carrying crop-wise nutrient recommendations for improving soil health "
            "and its productivity."
        ),
        "eligibility": "All farmers across India.",
        "benefits": (
            "Free soil testing and a Soil Health Card with nutrient status and fertiliser "
            "recommendations. Helps reduce input costs and improve yield."
        ),
        "application_process": (
            "Contact the nearest Krishi Vigyan Kendra (KVK) or agriculture department office. "
            "Soil samples are collected and tested; the card is delivered to the farmer."
        ),
        "category": "soil_health",
        "is_active": True,
    },
    {
        "name": "PM Krishi Sinchayee Yojana",
        "description": (
            "Pradhan Mantri Krishi Sinchayee Yojana aims to expand cultivable area under "
            "assured irrigation, improve on-farm water use efficiency, and promote 'Per Drop "
            "More Crop'."
        ),
        "eligibility": (
            "All farmers, with priority to small and marginal farmers, SC/ST farmers, "
            "and beneficiaries of MGNREGA."
        ),
        "benefits": (
            "Subsidy of 55% for small/marginal farmers and 45% for others on micro-irrigation "
            "systems (drip and sprinkler). Support for water harvesting and watershed development."
        ),
        "application_process": (
            "Apply through the state agriculture/horticulture department or online portal. "
            "Requires land documents, Aadhaar, and bank account details."
        ),
        "category": "irrigation",
        "is_active": True,
    },
]


async def init_db() -> None:
    """Create all tables and seed initial data."""
    logger.info("Initialising database …")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Tables created / verified.")

    # Seed government schemes if table is empty
    async with async_session_factory() as session:
        result = await session.execute(select(GovernmentScheme).limit(1))
        if result.scalars().first() is None:
            for scheme_data in SEED_SCHEMES:
                session.add(GovernmentScheme(**scheme_data))
            await session.commit()
            logger.info("Seeded %d government schemes.", len(SEED_SCHEMES))
        else:
            logger.info("Government schemes already seeded, skipping.")
