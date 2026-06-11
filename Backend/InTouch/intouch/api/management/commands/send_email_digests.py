"""Scheduled email digests, run from cron every 15 minutes.

Two jobs, both idempotent through timestamp marks:
- unread messages older than one hour -> one digest email per recipient
  (Message.unread_emailed_at marks what was already included);
- day-before reminders for accepted collaborations -> both parties
  (Reservation.reminder_sent_at).
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from intouch.api import emails
from intouch.api.models import Message, Reservation, User


class Command(BaseCommand):
    help = "Send unread-message digests and day-before visit reminders."

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(f"unread digests sent: {self._unread_digests(now)}")
        self.stdout.write(f"visit reminders sent: {self._visit_reminders(now)}")

    def _unread_digests(self, now):
        """One email per user listing how many messages await them."""
        pending = (Message.objects
                   .filter(read_at__isnull=True,
                           unread_emailed_at__isnull=True,
                           created_at__lte=now - timedelta(hours=1))
                   .select_related('conversation__venue', 'sender'))

        per_recipient = {}
        for message in pending:
            conversation = message.conversation
            if message.sender_id == conversation.influencer_id:
                recipient_id = conversation.venue.user_id
            else:
                recipient_id = conversation.influencer_id
            per_recipient.setdefault(recipient_id, []).append(message.id)

        sent = 0
        for recipient_id, message_ids in per_recipient.items():
            recipient = User.objects.filter(pk=recipient_id, is_active=True).first()
            if recipient and recipient.email_notifications:
                emails.send_unread_messages(recipient, len(message_ids))
                sent += 1
            # Mark even when the user opted out: these messages are handled,
            # they must not pile up into a giant count later.
            Message.objects.filter(id__in=message_ids).update(unread_emailed_at=now)
        return sent

    def _visit_reminders(self, now):
        """Both parties of every accepted visit happening within 24 hours."""
        upcoming = (Reservation.objects
                    .filter(status=1,
                            reminder_sent_at__isnull=True,
                            date_reservation__gt=now,
                            date_reservation__lte=now + timedelta(hours=24))
                    .select_related('offer__venue__user', 'user'))

        sent = 0
        for reservation in upcoming:
            for recipient in (reservation.user, reservation.offer.venue.user):
                if recipient.email_notifications:
                    emails.send_visit_reminder(reservation, recipient)
                    sent += 1
            reservation.reminder_sent_at = now
            reservation.save(update_fields=['reminder_sent_at'])
        return sent
