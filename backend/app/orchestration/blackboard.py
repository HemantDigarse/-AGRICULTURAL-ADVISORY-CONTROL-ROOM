"""Blackboard: shared in-memory state for multi-agent advisory pipeline."""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.schemas.blackboard import BlackboardState, AgentStatus

logger = logging.getLogger(__name__)


class Blackboard:
    """
    Thread-safe, per-request shared state that every agent reads from / writes to.

    Each request_id gets:
    - Its own BlackboardState
    - Its own asyncio.Lock (so agents running concurrently don't corrupt state)
    - Its own asyncio.Queue for SSE events pushed to the client
    """

    def __init__(self) -> None:
        self._states: Dict[str, BlackboardState] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        self._event_queues: Dict[str, asyncio.Queue] = {}

    # ── lifecycle ────────────────────────────────────────────────────────
    async def create(self, request_id: str, farmer_info: Optional[Dict[str, Any]] = None) -> BlackboardState:
        """Create a new blackboard for a request."""
        lock = asyncio.Lock()
        self._locks[request_id] = lock

        state = BlackboardState(
            request_id=request_id,
            status="processing",
            farmer_info=farmer_info,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self._states[request_id] = state
        self._event_queues[request_id] = asyncio.Queue()

        logger.info("Blackboard created for request %s", request_id)
        return state

    # ── reads ────────────────────────────────────────────────────────────
    async def get_state(self, request_id: str) -> Optional[BlackboardState]:
        """Return the current state (snapshot) for a request."""
        return self._states.get(request_id)

    def get_event_queue(self, request_id: str) -> Optional[asyncio.Queue]:
        """Return the SSE event queue for a request."""
        return self._event_queues.get(request_id)

    # ── writes ───────────────────────────────────────────────────────────
    async def update_section(
        self,
        request_id: str,
        section: str,
        data: Any,
    ) -> None:
        """Update a named section of the blackboard (e.g. 'weather_data')."""
        lock = self._locks.get(request_id)
        if lock is None:
            raise ValueError(f"No blackboard for request {request_id}")

        async with lock:
            state = self._states[request_id]
            setattr(state, section, data)
            state.updated_at = datetime.now(timezone.utc)

        await self._push_event(request_id, "section_updated", {"section": section})

    async def update_agent_status(
        self,
        request_id: str,
        agent_name: str,
        status: str,
        error: Optional[str] = None,
    ) -> None:
        """Update the status of an agent for this request."""
        lock = self._locks.get(request_id)
        if lock is None:
            raise ValueError(f"No blackboard for request {request_id}")

        now = datetime.now(timezone.utc)

        async with lock:
            state = self._states[request_id]
            agent_st = state.agents.get(agent_name, AgentStatus(name=agent_name))

            agent_st.status = status
            if status == "running":
                agent_st.started_at = now
            elif status in ("completed", "failed"):
                agent_st.completed_at = now
            if error:
                agent_st.error = error

            state.agents[agent_name] = agent_st
            state.updated_at = now

        event_type = f"agent_{status}"
        await self._push_event(request_id, event_type, {"agent": agent_name, "error": error})

    async def is_ready_for_coordination(self, request_id: str) -> bool:
        """Check whether all prerequisite agents have completed."""
        state = self._states.get(request_id)
        if state is None:
            return False

        required = {"intake", "weather", "market", "scheme", "crop", "risk"}
        completed = {
            name
            for name, a in state.agents.items()
            if a.status == "completed" and name in required
        }
        return required.issubset(completed)

    async def set_final_advisory(self, request_id: str, advisory_data: Dict[str, Any]) -> None:
        """Mark the request as completed with its final advisory."""
        lock = self._locks.get(request_id)
        if lock is None:
            raise ValueError(f"No blackboard for request {request_id}")

        async with lock:
            state = self._states[request_id]
            state.final_advisory = advisory_data
            state.status = "completed"
            state.completed_at = datetime.now(timezone.utc)
            state.updated_at = state.completed_at

        await self._push_event(request_id, "advisory_complete", advisory_data)

    async def mark_failed(self, request_id: str, reason: str) -> None:
        """Mark a request as failed and notify any SSE subscribers."""
        lock = self._locks.get(request_id)
        if lock is None:
            raise ValueError(f"No blackboard for request {request_id}")

        async with lock:
            state = self._states[request_id]
            state.status = "failed"
            state.failure_reason = reason
            state.completed_at = datetime.now(timezone.utc)
            state.updated_at = state.completed_at

        await self._push_event(request_id, "advisory_failed", {"error": reason})

    # ── SSE helpers ──────────────────────────────────────────────────────
    async def _push_event(self, request_id: str, event: str, data: Dict[str, Any]) -> None:
        queue = self._event_queues.get(request_id)
        if queue:
            await queue.put({
                "event": event,
                "data": data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

    def cleanup(self, request_id: str) -> None:
        """Remove all state for a finished request (optional GC)."""
        self._states.pop(request_id, None)
        self._locks.pop(request_id, None)
        self._event_queues.pop(request_id, None)


# Singleton
blackboard = Blackboard()
