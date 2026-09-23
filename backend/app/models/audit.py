from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Integer, DateTime, ForeignKey, Uuid, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base

class AuditLogEntry(Base):
    __tablename__ = "audit_log_entries"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    table_name = Column(String(64), nullable=False, index=True)
    record_id = Column(Uuid(as_uuid=True), nullable=False, index=True)
    action = Column(String(16), nullable=False) # INSERT, UPDATE, STATE_TRANSITION
    old_values = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    new_values = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    actor_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    actor_pseudonym = Column(String(64), nullable=True) # Used for DSGVO Art. 17 right to erasure (REQ-NFR-05)
    ip_address_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)

    # Actor relationship
    actor = relationship("Employee", foreign_keys=[actor_id])
