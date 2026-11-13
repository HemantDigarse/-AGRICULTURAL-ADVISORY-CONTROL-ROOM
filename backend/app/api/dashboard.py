"""Dashboard API routes."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from app.orchestration.blackboard import blackboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics including active requests, agent performance, etc."""
    # Gather stats from the in-memory blackboard
    all_states = blackboard._states

    total_requests = len(all_states)
    completed = sum(1 for s in all_states.values() if s.status == "completed")
    processing = sum(1 for s in all_states.values() if s.status == "processing")
    failed = sum(1 for s in all_states.values() if s.status == "failed")

    # Agent performance stats
    agent_stats = {}
    for state in all_states.values():
        for agent_name, agent_status in state.agents.items():
            if agent_name not in agent_stats:
                agent_stats[agent_name] = {
                    "total_runs": 0,
                    "completed": 0,
                    "failed": 0,
                    "running": 0,
                }
            agent_stats[agent_name]["total_runs"] += 1
            if agent_status.status == "completed":
                agent_stats[agent_name]["completed"] += 1
            elif agent_status.status == "failed":
                agent_stats[agent_name]["failed"] += 1
            elif agent_status.status == "running":
                agent_stats[agent_name]["running"] += 1

    # Recent requests
    recent_requests = []
    sorted_states = sorted(
        all_states.values(),
        key=lambda s: s.created_at or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    for state in sorted_states[:10]:
        farmer_info = state.farmer_info or {}
        location = farmer_info.get("location", {})
        recent_requests.append({
            "request_id": state.request_id,
            "status": state.status,
            "crop": farmer_info.get("crop", "Unknown"),
            "location": f"{location.get('city', 'Unknown')}, {location.get('state', 'Unknown')}",
            "created_at": state.created_at.isoformat() if state.created_at else None,
        })

    # Risk distribution
    risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for state in all_states.values():
        risk = (state.risk_assessment or {}).get("overall_risk_level", "LOW")
        if risk in risk_distribution:
            risk_distribution[risk] += 1

    return {
        "overview": {
            "total_requests": total_requests,
            "completed": completed,
            "processing": processing,
            "failed": failed,
            "success_rate": round(completed / total_requests * 100, 1) if total_requests > 0 else 0,
        },
        "agent_performance": agent_stats,
        "risk_distribution": risk_distribution,
        "recent_requests": recent_requests,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

