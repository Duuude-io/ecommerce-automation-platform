from dataclasses import dataclass
from typing import Any, Dict, Optional
import time


@dataclass
class AutomationUser:
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None


@dataclass
class AutomationLog:
    event: str
    handler: str
    status: str
    user: AutomationUser
    payload: Dict[str, Any]

    timestamp: float = time.time()

    def to_dict(self):
        return {
            "event": self.event,
            "handler": self.handler,
            "status": self.status,
            "timestamp": self.timestamp,
            "user": {
                "id": self.user.id,
                "email": self.user.email,
                "phone": self.user.phone,
                "name": self.user.name,
            },
            "payload": self.payload,
        }
