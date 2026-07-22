"""Steps for offer_lifecycle.feature: create, freeze, duplicate, archive."""
from behave import when, then

from intouch.api.models import Offer


def _brand_offers(context):
    """The brand's own offer listing, keyed by id (archived ones included)."""
    context.client.force_authenticate(user=context.brand)
    response = context.client.get(f'/api/offer/?venue={context.venue.id}')
    assert response.status_code == 200, response.content
    data = response.json()
    items = data['results'] if isinstance(data, dict) else data
    return {offer['id']: offer for offer in items}


def _influencer_offer_ids(context):
    context.client.force_authenticate(user=context.influencer)
    response = context.client.get(f'/api/offer/?venue={context.venue.id}')
    assert response.status_code == 200, response.content
    data = response.json()
    items = data['results'] if isinstance(data, dict) else data
    return [offer['id'] for offer in items]


@when('the brand creates an offer named "{name}"')
def step_create_offer(context, name):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.post('/api/offer/', {
        'venue': context.venue.id, 'name': name,
        'content': 'x', 'conditions': 'x', 'tags': 'x',
    }, format='json')
    if context.response.status_code == 201:
        context.created_offer_id = context.response.json()['id']


@then('the new offer is editable')
def step_new_offer_editable(context):
    assert _brand_offers(context)[context.created_offer_id]['isEditable'] is True


@when('the brand renames the offer to "{name}"')
def step_rename_offer(context, name):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.patch(
        f'/api/offer/{context.offer.id}', {'name': name}, format='json')


@then('the offer keeps its name')
def step_offer_keeps_name(context):
    context.offer.refresh_from_db()
    assert context.offer.name == 'Test Offer'


@when('the brand duplicates the offer')
def step_duplicate_offer(context):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.post(f'/api/offer/{context.offer.id}/duplicate')


@then('the copy is editable')
def step_copy_editable(context):
    body = context.response.json()
    assert body['id'] != context.offer.id
    assert body['isEditable'] is True


@then('the original offer is still frozen')
def step_original_frozen(context):
    context.client.force_authenticate(user=context.brand)
    response = context.client.patch(
        f'/api/offer/{context.offer.id}', {'name': 'Should not stick'}, format='json')
    assert response.status_code == 400, response.content
    context.offer.refresh_from_db()
    assert context.offer.name == 'Test Offer'


@when('the brand archives the offer')
def step_archive_offer(context):
    context.client.force_authenticate(user=context.brand)
    context.response = context.client.delete(f'/api/offer/{context.offer.id}')


@then("the offer is hidden from the influencer's catalog")
def step_offer_hidden(context):
    assert context.offer.id not in _influencer_offer_ids(context)


@then("the offer still appears in the brand's listing")
def step_offer_listed(context):
    assert context.offer.id in _brand_offers(context)
