# Data-preserving rename Company -> Venue (model, table, columns, FKs).
# Manually written so the rename is captured as RenameModel/RenameField
# (table/column rename) instead of drop+create (which would lose data).

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_fcmtoken'),
    ]

    operations = [
        migrations.RenameModel(old_name='TypeCompany', new_name='TypeVenue'),
        migrations.RenameModel(old_name='Company', new_name='Venue'),
        migrations.RenameModel(old_name='imgCompany', new_name='imgVenue'),
        migrations.RenameField(model_name='venue', old_name='name_company', new_name='name_venue'),
        migrations.RenameField(model_name='venue', old_name='type_company', new_name='type_venue'),
        migrations.RenameField(model_name='imgvenue', old_name='company', new_name='venue'),
        migrations.RenameField(model_name='opening', old_name='company', new_name='venue'),
        migrations.RenameField(model_name='offer', old_name='company', new_name='venue'),
    ]
