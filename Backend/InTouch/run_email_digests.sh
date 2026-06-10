#!/bin/bash
# Cron wrapper: run the email digests from the backend directory.
cd /home/ubuntu/django_app_influenceur/Backend/InTouch || exit 1
exec env/bin/python manage.py send_email_digests
