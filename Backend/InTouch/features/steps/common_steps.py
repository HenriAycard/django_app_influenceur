"""World-building Given steps and generic response assertions, shared by every
feature. Fixtures come from intouch.api.test_support so the Gherkin layer and
the unit test suite build the exact same brand / influencer / venue / offer.
"""
from behave import given, then

from intouch.api.test_support import make_brand, make_influencer, make_venue, make_offer


@given('a brand with a venue')
def step_brand_with_venue(context):
    context.brand = make_brand()
    context.venue = make_venue(context.brand)


@given('an influencer with {followers:d} Instagram followers')
def step_influencer(context, followers):
    context.influencer = make_influencer(followers=followers)


@given('an open offer')
def step_open_offer(context):
    context.offer = make_offer(context.venue)


@then('the request succeeds with status {code:d}')
def step_request_succeeds(context, code):
    assert context.response.status_code == code, context.response.content


@then('the request is rejected with status {code:d}')
def step_request_rejected(context, code):
    assert context.response.status_code == code, context.response.content
