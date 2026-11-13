"""Base agent interface and agent registry."""

import abc
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class BaseAgent(abc.ABC):
    """Abstract base class for all advisory agents."""

    def __init__(self, name: str, description: str = "") -> None:
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"agent.{name}")

    @abc.abstractmethod
    async def execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """
        Execute the agent's task.

        Args:
            blackboard: The shared Blackboard instance.
            request_id: The advisory request identifier.

        Returns:
            A dict with the agent's output data.
        """
        ...

    async def _safe_execute(self, blackboard: Any, request_id: str) -> Dict[str, Any]:
        """Wrap execute with status updates and error handling."""
        try:
            await blackboard.update_agent_status(request_id, self.name, "running")
            result = await self.execute(blackboard, request_id)
            await blackboard.update_agent_status(request_id, self.name, "completed")
            return result
        except Exception as exc:
            self.logger.exception("Agent %s failed for %s", self.name, request_id)
            await blackboard.update_agent_status(
                request_id, self.name, "failed", error=str(exc)
            )
            return {"error": str(exc), "agent": self.name}

