import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class NoticePost(Base):
    __tablename__ = "notice_posts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    is_mandatory_ack = Column(Boolean, nullable=False, default=False)
    published_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    archived_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    author = relationship("Employee", foreign_keys=[author_id])
    acknowledgments = relationship("NoticeAcknowledgment", back_populates="post", cascade="all, delete-orphan")

class NoticeAcknowledgment(Base):
    __tablename__ = "notice_acknowledgments"
    __table_args__ = (
        UniqueConstraint("post_id", "employee_id", name="uq_notice_employee_ack"),
    )

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(Uuid(as_uuid=True), ForeignKey("notice_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Uuid(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    ip_hash = Column(String(64), nullable=False)

    # Relationships
    post = relationship("NoticePost", back_populates="acknowledgments")
    employee = relationship("Employee", back_populates="notice_acknowledgments")
