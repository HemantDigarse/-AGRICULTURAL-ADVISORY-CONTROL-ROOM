"""Advisory API routes."""

import asyncio
import json
import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.schemas.farmer import FarmerInput
from app.schemas.advisory import AdvisoryCreateResponse, AdvisoryStatusResponse, AdvisoryResultResponse
from app.schemas.agents import AgentListResponse, AgentExecutionInfo
from app.orchestration.blackboard import blackboard
from app.orchestration.orchestrator import orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/advisory", tags=["advisory"])


@router.post("/create", response_model=AdvisoryCreateResponse)
async def create_advisory(farmer_input: FarmerInput, background_tasks: BackgroundTasks):
    """
    Create a new advisory request.

    Accepts farmer input and kicks off the multi-agent pipeline in the background.
    Returns the request_id for tracking.
    """
    try:
        # Convert input to dict
        input_data = {
            "crop": farmer_input.crop,
            "location": {
                "city": farmer_input.location.city,
                "district": farmer_input.location.district or "",
                "state": farmer_input.location.state,
            },
            "growth_stage": farmer_input.growth_stage,
            "farmer_name": farmer_input.farmer_name or "Anonymous Farmer",
            "farm_size": farmer_input.farm_size,
            "query": farmer_input.query or "",
        }

        # Run pipeline in background
        request_id = await _start_pipeline(input_data, background_tasks)

        return AdvisoryCreateResponse(
            request_id=request_id,
            status="processing",
            message=f"Advisory request {request_id} created. Pipeline is running.",
        )
    except Exception as exc:
        logger.exception("Failed to create advisory")
        raise HTTPException(status_code=500, detail=str(exc))


async def _start_pipeline(input_data: dict, background_tasks: BackgroundTasks) -> str:
    """Start the orchestration pipeline and return request_id immediately."""
    # We need to get the request_id before the pipeline runs fully
    from app.agents.intake_agent import generate_request_id
    request_id = generate_request_id()

    # Create blackboard with farmer info
    await blackboard.create(request_id, farmer_info=input_data)

    # Run pipeline in background
    background_tasks.add_task(_run_pipeline, request_id)

    return request_id


async def _run_pipeline(request_id: str):
    """Run the full pipeline for a pre-created request."""
    from app.agents.intake_agent import IntakeAgent
    from app.agents.weather_agent import WeatherAgent
    from app.agents.crop_agent import CropAdvisoryAgent
    from app.agents.market_agent import MarketIntelligenceAgent
    from app.agents.scheme_agent import GovernmentSchemeAgent
    from app.agents.risk_alert_agent import RiskAlertAgent
    from app.agents.coordinator_agent import CoordinatorAgent

    intake = IntakeAgent()
    weather = WeatherAgent()
    crop = CropAdvisoryAgent()
    market = MarketIntelligenceAgent()
    scheme = GovernmentSchemeAgent()
    risk = RiskAlertAgent()
    coordinator = CoordinatorAgent()

    try:
        # Phase 1
        await intake._safe_execute(blackboard, request_id)

        # Phase 2: parallel
        await asyncio.gather(
            weather._safe_execute(blackboard, request_id),
            market._safe_execute(blackboard, request_id),
            scheme._safe_execute(blackboard, request_id),
            return_exceptions=True,
        )

        # Phase 3: after weather
        await asyncio.gather(
            crop._safe_execute(blackboard, request_id),
            risk._safe_execute(blackboard, request_id),
            return_exceptions=True,
        )

        # Phase 4: coordinator
        await coordinator._safe_execute(blackboard, request_id)

    except Exception as exc:
        logger.exception("Pipeline failed for %s: %s", request_id, exc)


@router.get("/{request_id}", response_model=AdvisoryStatusResponse)
async def get_advisory_status(request_id: str):
    """Get the current status of an advisory request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    farmer_info = state.farmer_info or {}
    location = farmer_info.get("location", {})

    return AdvisoryStatusResponse(
        request_id=request_id,
        status=state.status,
        crop=farmer_info.get("crop", "Unknown"),
        location={
            "city": location.get("city"),
            "district": location.get("district"),
            "state": location.get("state"),
        },
        growth_stage=farmer_info.get("growth_stage"),
        created_at=state.created_at,
        completed_at=None,
    )


@router.get("/{request_id}/agents", response_model=AgentListResponse)
async def get_agent_statuses(request_id: str):
    """Get the execution status of all agents for a request."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    agents = []
    for name, agent_status in state.agents.items():
        agents.append(AgentExecutionInfo(
            agent_name=name,
            status=agent_status.status,
            started_at=agent_status.started_at,
            completed_at=agent_status.completed_at,
            error=agent_status.error,
        ))

    return AgentListResponse(request_id=request_id, agents=agents)


@router.get("/{request_id}/result", response_model=AdvisoryResultResponse)
async def get_advisory_result(request_id: str):
    """Get the final advisory result."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    if state.status != "completed" or state.final_advisory is None:
        return AdvisoryResultResponse(
            request_id=request_id,
            status=state.status,
        )

    fa = state.final_advisory
    return AdvisoryResultResponse(
        request_id=request_id,
        status="completed",
        summary=fa.get("summary"),
        detailed_advisory=fa.get("detailed_advisory"),
        immediate_actions=fa.get("immediate_actions"),
        weekly_plan=fa.get("weekly_plan"),
        risk_summary=fa.get("risk_summary"),
        market_summary=fa.get("market_summary"),
        scheme_recommendations=fa.get("scheme_recommendations"),
        confidence_score=fa.get("confidence_score"),
    )


@router.get("/{request_id}/stream")
async def stream_advisory(request_id: str):
    """Stream advisory updates via Server-Sent Events (SSE)."""
    state = await blackboard.get_state(request_id)
    if state is None:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found")

    event_queue = blackboard.get_event_queue(request_id)
    if event_queue is None:
        raise HTTPException(status_code=404, detail=f"No event stream for {request_id}")

    async def event_generator():
        while True:
            try:
                event = await asyncio.wait_for(event_queue.get(), timeout=60.0)
                yield {
                    "event": event.get("event", "message"),
                    "data": json.dumps(event.get("data", {})),
                }

                # Stop streaming after advisory is complete
                if event.get("event") == "advisory_complete":
                    break
            except asyncio.TimeoutError:
                # Send keepalive
                yield {"event": "keepalive", "data": "{}"}
            except Exception:
                break

    return EventSourceResponse(event_generator())

