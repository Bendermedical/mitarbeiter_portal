import hashlib
import json
from typing import Optional, Any, Dict
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.audit import AuditLogEntry

class AuditService:
    @staticmethod
    def hash_ip(ip: Optional[str]) -> Optional[str]:
        if not ip:
            return None
        return hashlib.sha256(ip.encode("utf-8")).hexdigest()

    @classmethod
    def log_event(
        cls,
        db: Session,
        table_name: str,
        record_id: UUID,
        action: str,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        actor_id: Optional[UUID] = None,
        actor_pseudonym: Optional[str] = None,
        client_ip: Optional[str] = None,
    ) -> AuditLogEntry:
        # Convert date/datetime/UUID in values to string for JSON serialization
        def sanitize_val(obj):
            if isinstance(obj, dict):
                return {k: sanitize_val(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize_val(v) for v in obj]
            elif hasattr(obj, "isoformat"):
                return obj.isoformat()
            elif isinstance(obj, UUID):
                return str(obj)
            return obj

        entry = AuditLogEntry(
            table_name=table_name,
            record_id=record_id,
            action=action,
            old_values=sanitize_val(old_values) if old_values else None,
            new_values=sanitize_val(new_values) if new_values else None,
            actor_id=actor_id,
            actor_pseudonym=actor_pseudonym,
            ip_address_hash=cls.hash_ip(client_ip),
        )
        db.add(entry)
        db.flush()
        return entry
