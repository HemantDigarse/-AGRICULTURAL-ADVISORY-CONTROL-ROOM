"""SQLAlchemy ORM models for all 9 database tables."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import DeclarativeBase, relationship


def _utcnow():
    return datetime.now(timezone.utc)


def _new_id():
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


# ── 1. Farmers ──────────────────────────────────────────────────────────────
class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String(36), primary_key=True, default=_new_id)
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    city = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    farm_size_acres = Column(Float, nullable=True)
    primary_crop = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    advisory_requests = relationship("AdvisoryRequest", back_populates="farmer")


# ── 2. Advisory Requests ────────────────────────────────────────────────────
class AdvisoryRequest(Base):
    __tablename__ = "advisory_requests"

    id = Column(String(36), primary_key=True, default=_new_id)
    farmer_id = Column(String(36), ForeignKey("farmers.id"), nullable=True)
    crop = Column(String(255), nullable=False)
    growth_stage = Column(String(100), nullable=True)
    city = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    query_text = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending | processing | completed | failed
    created_at = Column(DateTime, default=_utcnow)
    completed_at = Column(DateTime, nullable=True)

    farmer = relationship("Farmer", back_populates="advisory_requests")
    agent_executions = relationship("AgentExecution", back_populates="advisory_request")
    final_advisory = relationship("FinalAdvisory", back_populates="advisory_request", uselist=False)


# ── 3. Agent Executions ─────────────────────────────────────────────────────
class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")  # pending | running | completed | failed
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    advisory_request = relationship("AdvisoryRequest", back_populates="agent_executions")


# ── 4. Weather Reports ──────────────────────────────────────────────────────
class WeatherReport(Base):
    __tablename__ = "weather_reports"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    temperature_c = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    condition = Column(String(100), nullable=True)
    forecast_json = Column(JSON, nullable=True)
    fetched_at = Column(DateTime, default=_utcnow)


# ── 5. Crop Advisories ──────────────────────────────────────────────────────
class CropAdvisory(Base):
    __tablename__ = "crop_advisories"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False)
    crop = Column(String(255), nullable=False)
    growth_stage = Column(String(100), nullable=True)
    advisory_text = Column(Text, nullable=True)
    irrigation_advice = Column(Text, nullable=True)
    fertilizer_advice = Column(Text, nullable=True)
    pest_management = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_utcnow)


# ── 6. Market Reports ───────────────────────────────────────────────────────
class MarketReport(Base):
    __tablename__ = "market_reports"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False)
    crop = Column(String(255), nullable=False)
    mandi_name = Column(String(255), nullable=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    unit = Column(String(50), default="INR/quintal")
    price_trend = Column(String(50), nullable=True)  # rising | stable | falling
    market_data = Column(JSON, nullable=True)
    fetched_at = Column(DateTime, default=_utcnow)


# ── 7. Government Schemes ───────────────────────────────────────────────────
class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(String(36), primary_key=True, default=_new_id)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    application_process = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── 8. Risk Alerts ──────────────────────────────────────────────────────────
class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False)
    risk_type = Column(String(100), nullable=False)  # weather | pest | market | disease
    severity = Column(String(50), nullable=True)  # low | medium | high | critical
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    mitigation_steps = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_utcnow)


# ── 9. Final Advisories ─────────────────────────────────────────────────────
class FinalAdvisory(Base):
    __tablename__ = "final_advisories"

    id = Column(String(36), primary_key=True, default=_new_id)
    request_id = Column(String(36), ForeignKey("advisory_requests.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    detailed_advisory = Column(Text, nullable=True)
    immediate_actions = Column(JSON, nullable=True)
    weekly_plan = Column(JSON, nullable=True)
    risk_summary = Column(JSON, nullable=True)
    market_summary = Column(JSON, nullable=True)
    scheme_recommendations = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    advisory_request = relationship("AdvisoryRequest", back_populates="final_advisory")
