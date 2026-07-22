"""Steps for registration.feature: sign-up creates an inactive, password-less
account; influencers must supply a social handle."""
from behave import when, then

from intouch.api.models import User


@when('someone registers as an influencer with Instagram handle "{handle}"')
def step_register_influencer(context, handle):
    context.registered_email = 'newcomer@test.io'
    context.response = context.client.post('/api/register/', {
        'email': context.registered_email, 'firstname': 'New', 'lastname': 'Comer',
        'role': 'influencer', 'instagram': handle,
    }, format='json')


@when('someone registers as an influencer without a social handle')
def step_register_influencer_no_handle(context):
    context.response = context.client.post('/api/register/', {
        'email': 'nohandle@test.io', 'firstname': 'No', 'lastname': 'Handle',
        'role': 'influencer',
    }, format='json')


@when('someone registers as a brand')
def step_register_brand(context):
    context.registered_email = 'brandnew@test.io'
    context.response = context.client.post('/api/register/', {
        'email': context.registered_email, 'firstname': 'Brand', 'lastname': 'New',
        'role': 'venue',
    }, format='json')


@then('the new account is inactive')
def step_account_inactive(context):
    assert User.objects.get(email=context.registered_email).is_active is False


@then('the new account has no usable password')
def step_account_no_password(context):
    assert User.objects.get(email=context.registered_email).has_usable_password() is False


@then('the new account is flagged as an influencer')
def step_account_flagged_influencer(context):
    assert User.objects.get(email=context.registered_email).is_influencer is True
