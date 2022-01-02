# Generated by Django 3.2.8 on 2021-10-19 20:28

import autoslug.fields
from django.db import migrations, models
import django.db.models.deletion
import imagekit.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        editable=False,
                        help_text="The name of the product is set only once when creating",
                        max_length=50,
                        unique=True,
                        verbose_name="name",
                    ),
                ),
                (
                    "slug",
                    autoslug.fields.AutoSlugField(
                        editable=False,
                        populate_from="name",
                        unique=True,
                        verbose_name="slug",
                    ),
                ),
                (
                    "description",
                    models.CharField(
                        blank=True, max_length=300, verbose_name="description"
                    ),
                ),
                ("website", models.URLField(verbose_name="website url")),
                (
                    "price",
                    models.CharField(
                        choices=[("F", "Free"), ("P", "Paid"), ("O", "Open-Source")],
                        default="F",
                        max_length=1,
                        verbose_name="price",
                    ),
                ),
            ],
            options={
                "verbose_name": "product",
                "verbose_name_plural": "products",
            },
        ),
        migrations.CreateModel(
            name="ProductImage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "image",
                    imagekit.models.fields.ProcessedImageField(upload_to="products/"),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="product.product",
                        verbose_name="product",
                    ),
                ),
            ],
            options={
                "verbose_name": "product image",
                "verbose_name_plural": "product images",
            },
        ),
    ]
