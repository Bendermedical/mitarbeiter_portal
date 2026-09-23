from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.notice import NoticePost, NoticeAcknowledgment
from app.models.employee import Employee
from app.schemas.notice import NoticePostCreate, NoticePostRead
from app.services.audit_service import AuditService

class NoticeService:
    @staticmethod
    def create_notice(
        db: Session,
        author: Employee,
        payload: NoticePostCreate,
        client_ip: Optional[str] = None,
    ) -> NoticePost:
        post = NoticePost(
            title=payload.title,
            content=payload.content,
            author_id=author.id,
            is_mandatory_ack=payload.is_mandatory_ack,
        )
        db.add(post)
        db.flush()

        AuditService.log_event(
            db=db,
            table_name="notice_posts",
            record_id=post.id,
            action="CREATE",
            new_values={
                "title": post.title,
                "is_mandatory_ack": post.is_mandatory_ack,
            },
            actor_id=author.id,
            client_ip=client_ip,
        )
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def list_notices_for_employee(
        db: Session,
        employee_id: UUID,
    ) -> List[NoticePostRead]:
        posts = (
            db.query(NoticePost)
            .filter(NoticePost.archived_at.is_(None))
            .order_by(NoticePost.published_at.desc())
            .all()
        )
        
        # Query employee acknowledgments
        ack_post_ids = set(
            p_id for (p_id,) in db.query(NoticeAcknowledgment.post_id)
            .filter(NoticeAcknowledgment.employee_id == employee_id)
            .all()
        )

        result = []
        for p in posts:
            item = NoticePostRead(
                id=p.id,
                title=p.title,
                content=p.content,
                author_id=p.author_id,
                is_mandatory_ack=p.is_mandatory_ack,
                published_at=p.published_at,
                archived_at=p.archived_at,
                has_acknowledged=p.id in ack_post_ids if p.is_mandatory_ack else None,
            )
            result.append(item)
        return result

    @staticmethod
    def acknowledge_notice(
        db: Session,
        post_id: UUID,
        employee: Employee,
        client_ip: str,
    ) -> NoticeAcknowledgment:
        post = db.query(NoticePost).filter(NoticePost.id == post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notice post not found",
            )
        if not post.is_mandatory_ack:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This notice does not require formal acknowledgment",
            )

        # Check existing acknowledgment
        existing = (
            db.query(NoticeAcknowledgment)
            .filter(
                NoticeAcknowledgment.post_id == post_id,
                NoticeAcknowledgment.employee_id == employee.id,
            )
            .first()
        )
        if existing:
            return existing

        ip_hash = AuditService.hash_ip(client_ip) or "0000000000000000000000000000000000000000000000000000000000000000"
        ack = NoticeAcknowledgment(
            post_id=post_id,
            employee_id=employee.id,
            ip_hash=ip_hash,
        )
        db.add(ack)
        db.flush()

        # Write immutable audit log entry (REQ-HR-04 & REQ-NFR-08)
        AuditService.log_event(
            db=db,
            table_name="notice_acknowledgments",
            record_id=ack.id,
            action="ACKNOWLEDGE",
            new_values={
                "post_id": post_id,
                "title": post.title,
                "acknowledged_at": ack.acknowledged_at,
            },
            actor_id=employee.id,
            client_ip=client_ip,
        )
        db.commit()
        db.refresh(ack)
        return ack
