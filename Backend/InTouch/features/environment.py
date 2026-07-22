"""Behave hooks.

behave-django (run with --simple) already wraps each scenario in a database
transaction that is rolled back afterwards, so scenarios never leak state.
Here we just reset the per-scenario essentials: the throttle cache and a fresh
authenticated-by-actor API client.
"""
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient


def before_all(context):
    # The test client speaks plain http; without this every request is answered
    # with an empty 301 to https (mirrors tests.py's @override_settings).
    context.ssl_override = override_settings(SECURE_SSL_REDIRECT=False)
    context.ssl_override.enable()


def after_all(context):
    context.ssl_override.disable()


def before_scenario(context, scenario):
    cache.clear()  # throttle counters live in the (locmem) cache
    context.client = APIClient()  # re-authenticated per actor inside the steps
    context.response = None
