"""Steps for reservation_flow.feature: apply, accept, post link, validate,
no-show, and the follower gate."""
from behave import given, when, then
from django.utils import timezone

from intouch.api.models import Reservation


@given('the influencer has applied to the offer')
def step_influencer_applied(context):
    Reservation.objects.create(
        user=context.influencer, offer=context.offer, status=0,
        date_reservation=timezone.now() + timezone.timedelta(days=3))


@given('the offer requires {followers:d} Instagram followers')
def step_offer_requires_followers(context, followers):
    context.offer.min_followers_instagram = followers
    context.offer.save()


@given('the influencer has an accepted collaboration in the past')
def step_past_accepted(context):
    reservation = Reservation.objects.create(
        user=context.influencer, offer=context.offer, status=1,
        date_reservation=timezone.now() - timezone.timedelta(days=1))
    context.reservation_id = reservation.id


@given('the collaboration date has passed')
def step_date_passed(context):
    Reservation.objects.filter(id=context.reservation_id).update(
        date_reservation=timezone.now() - timezone.timedelta(days=1))


@when('the influencer applies to the offer')
def step_apply(context):
    context.client.force_authenticate(user=context.influencer)
    context.response = context.client.post('/api/reservation/', {
        'offer_id': context.offer.id,
        'date_reservation': (timezone.now() + timezone.timedelta(days=3)).isoformat(),
    }, format='json')
    if context.response.status_code == 201:
        context.reservation_id = context.response.json()['id']


@when('the brand accepts the application')
def step_accept(context):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.patch(
        f'/api/reservation/{context.reservation_id}', {'status': 1}, format='json')


@when('the influencer submits their post link')
def step_submit_post_link(context):
    context.client.force_authenticate(user=context.influencer)
    context.response = context.client.post(
        f'/api/reservation/{context.reservation_id}/post-link',
        {'url': 'https://instagram.com/p/abc'}, format='json')


@when('the brand validates the collaboration')
def step_validate(context):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.post(
        f'/api/reservation/{context.reservation_id}/complete', {}, format='json')


@when('the brand reports a no-show')
def step_no_show(context):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.post(
        f'/api/reservation/{context.reservation_id}/no-show', {}, format='json')


@then('the application is pending')
def step_application_pending(context):
    assert context.response.status_code == 201, context.response.content
    assert Reservation.objects.get(id=context.reservation_id).status == 0


@then('the application is accepted')
def step_application_accepted(context):
    assert context.response.status_code == 200, context.response.content
    assert Reservation.objects.get(id=context.reservation_id).status == 1


@then('the application is rejected')
def step_application_rejected(context):
    assert context.response.status_code == 400, context.response.content


@then('the collaboration is marked as completed')
def step_marked_completed(context):
    assert Reservation.objects.get(id=context.reservation_id).completed_at is not None


@then('the collaboration is marked as a no-show')
def step_marked_no_show(context):
    assert Reservation.objects.get(id=context.reservation_id).no_show_at is not None
