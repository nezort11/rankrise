# Generated by Django 3.2.8 on 2021-10-21 09:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='website',
            field=models.URLField(blank=True, verbose_name='website url'),
        ),
    ]