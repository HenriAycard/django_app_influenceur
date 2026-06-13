"""Transactional emails.

Every send is best-effort and fire-and-forget (a daemon thread), mirroring the
FCM `_notify` philosophy: a mail outage must never break the action that
triggered it. Notification emails honour `user.email_notifications`; account
emails (the set-password invitation) are always sent.
"""
import logging
import threading

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


def _deliver(subject, html, to):
    try:
        send_mail(
            subject=subject,
            message=strip_tags(html),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to],
            html_message=html,
        )
    except Exception as e:
        logger.warning("Email to %s failed: %s", to, e)


def _send(user, subject, *, title, lines, button_label=None, button_url=None, force=False):
    """Render the shared template and send asynchronously.

    `force=True` bypasses the user's notification preference — reserved for
    account emails the user must receive (e.g. the set-password invitation).
    """
    if not force and not user.email_notifications:
        return
    html = render_to_string('email/base.html', {
        'subject': subject,
        'title': title,
        'lines': lines,
        'button_label': button_label,
        'button_url': button_url,
        'app_url': settings.FRONTEND_URL,
    })
    threading.Thread(target=_deliver, args=(subject, html, user.email), daemon=True).start()


def set_password_link(user):
    """djoser-compatible uid/token link to the SPA set-password page."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/set-password?uid={uid}&token={token}"


def send_account_approved(user):
    _send(
        user,
        "Your InTouch account has been approved",
        title=f"Welcome to InTouch, {user.firstname}!",
        lines=[
            "Your application to join InTouch has been approved.",
            "Set your password to activate your account and start collaborating.",
            "This link stays valid for 7 days.",
        ],
        button_label="Set my password",
        button_url=set_password_link(user),
        force=True,
    )


def send_new_application(reservation):
    owner = reservation.offer.venue.user
    influencer = reservation.user
    _send(
        owner,
        "New application on InTouch",
        title="You have a new application",
        lines=[
            f"{influencer.firstname} {influencer.lastname} applied to your offer "
            f"“{reservation.offer.name}” at {reservation.offer.venue.name_venue}.",
            "Review the application to accept or decline it.",
        ],
        button_label="Open InTouch",
        button_url=settings.FRONTEND_URL,
    )


def send_application_decided(reservation, accepted):
    influencer = reservation.user
    venue = reservation.offer.venue
    if accepted:
        when = reservation.date_reservation
        date_line = (
            f"Scheduled for {when.strftime('%A %d %B %Y, %H:%M')}." if when else None
        )
        lines = [
            f"Great news — {venue.name_venue} accepted your application for "
            f"“{reservation.offer.name}”.",
        ]
        if date_line:
            lines.append(date_line)
        lines.append("Your contract and calendar invite are available in the app.")
        subject = "Your collaboration is confirmed"
        title = "Application accepted 🎉"
    else:
        lines = [
            f"{venue.name_venue} did not select your application for "
            f"“{reservation.offer.name}” this time.",
            "Keep exploring — new offers are published regularly.",
        ]
        subject = "Update on your application"
        title = "Application not selected"
    _send(influencer, subject, title=title, lines=lines,
          button_label="Open InTouch", button_url=settings.FRONTEND_URL)


def send_post_submitted(reservation):
    owner = reservation.offer.venue.user
    influencer = reservation.user
    _send(
        owner,
        "Content published for your collaboration",
        title="The post is live!",
        lines=[
            f"{influencer.firstname} {influencer.lastname} shared the content "
            f"published for “{reservation.offer.name}” at {reservation.offer.venue.name_venue}:",
            reservation.post_url,
            "Review it and validate the collaboration in the app.",
        ],
        button_label="Open InTouch",
        button_url=settings.FRONTEND_URL,
    )


def send_collaboration_validated(reservation):
    _send(
        reservation.user,
        "Your collaboration has been validated",
        title="Collaboration validated 🎉",
        lines=[
            f"{reservation.offer.venue.name_venue} confirmed your collaboration "
            f"for “{reservation.offer.name}”.",
            "It now counts in your realized collaborations. Well done!",
        ],
        button_label="Open InTouch",
        button_url=settings.FRONTEND_URL,
    )


def send_unread_messages(user, count):
    plural = "s" if count > 1 else ""
    _send(
        user,
        f"You have {count} unread message{plural} on InTouch",
        title="While you were away…",
        lines=[f"You have {count} unread message{plural} waiting in your inbox."],
        button_label="Read my messages",
        button_url=settings.FRONTEND_URL,
    )


def send_invitation(reservation):
    influencer = reservation.user
    venue = reservation.offer.venue
    offer_name = reservation.offer.name
    _send(
        influencer,
        f"You have an invitation from {venue.name_venue}",
        title="You have an invitation!",
        lines=[
            f'{venue.name_venue} invited you to collaborate on their offer "{offer_name}".',
            "Open InTouch to review and accept or decline.",
        ],
        button_label="View invitation",
        button_url=settings.FRONTEND_URL,
    )


def send_date_proposed(reservation):
    owner = reservation.offer.venue.user
    influencer = reservation.user
    offer_name = reservation.offer.name
    _send(
        owner,
        f"{influencer.firstname} proposed a date",
        title="Date proposal received",
        lines=[
            f'{influencer.firstname} {influencer.lastname} proposed a date for your invitation on "{offer_name}".',
            "Open InTouch to review and confirm the proposed date.",
        ],
        button_label="Confirm date",
        button_url=settings.FRONTEND_URL,
    )


def send_invitation_responded(reservation, accepted):
    owner = reservation.offer.venue.user
    influencer = reservation.user
    offer_name = reservation.offer.name
    if accepted:
        subject = "Invitation accepted"
        title = f"{influencer.firstname} is in!"
        lines = [
            f'{influencer.firstname} {influencer.lastname} accepted your invitation for "{offer_name}".',
            "The collaboration is now confirmed.",
        ]
    else:
        subject = "Invitation declined"
        title = "Invitation not accepted"
        lines = [
            f'{influencer.firstname} {influencer.lastname} declined your invitation for "{offer_name}".',
            "You can invite another influencer or wait for new applications.",
        ]
    _send(owner, subject, title=title, lines=lines,
          button_label="Open InTouch", button_url=settings.FRONTEND_URL)


def send_visit_reminder(reservation, recipient):
    venue = reservation.offer.venue
    when = reservation.date_reservation
    influencer = reservation.user
    if recipient.id == influencer.id:
        line = (f"Your collaboration at {venue.name_venue} "
                f"(“{reservation.offer.name}”) is tomorrow.")
    else:
        line = (f"{influencer.firstname} {influencer.lastname} visits "
                f"{venue.name_venue} tomorrow (“{reservation.offer.name}”).")
    _send(
        recipient,
        "Reminder: collaboration tomorrow",
        title="See you tomorrow!",
        lines=[line, f"Scheduled at {when.strftime('%H:%M')}." if when else ""],
        button_label="Open InTouch",
        button_url=settings.FRONTEND_URL,
    )
