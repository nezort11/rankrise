# Generated by Django 3.2.8 on 2021-10-23 12:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("question", "0001_initial"),
        ("product", "0003_alter_product_name"),
        ("option", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="option",
            name="product",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="options",
                to="product.product",
                verbose_name="product",
            ),
        ),
        migrations.AlterField(
            model_name="option",
            name="question",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="options",
                to="question.question",
                verbose_name="question",
            ),
        ),
    ]
