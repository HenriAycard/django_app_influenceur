from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_require_post_proof'),
    ]

    operations = [
        # Nullable on purpose: existing venues keep NULL (unknown creation
        # date) so the feed's newness boost only applies to venues created
        # from now on.
        migrations.AddField(
            model_name='venue',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
