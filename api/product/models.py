from django.db import models
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from autoslug import AutoSlugField
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill

from category.models import Category


class PriceChoices(models.TextChoices):
    FREE = "F", _("Free")
    PAID = "P", _("Paid")
    OPEN_SOURCE = "O", _("Open-Source")


class Product(models.Model):
    name = models.CharField(
        _("name"),
        max_length=50,
        unique=True,
        blank=False,
        help_text=_("The name of the product is set only once when creating"),
    )
    slug = AutoSlugField(_("slug"), populate_from="name", unique=True, editable=False)
    description = models.CharField(_("description"), max_length=300, blank=True)
    website = models.URLField(_("website url"), max_length=200, blank=True)
    price = models.CharField(
        _("price"),
        max_length=1,
        choices=PriceChoices.choices,
        default=PriceChoices.FREE,
    )
    category = models.ForeignKey(
        "category.Category",
        verbose_name=_("category"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    class Meta:
        verbose_name = _("product")
        verbose_name_plural = _("products")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("product-detail", kwargs={"slug": self.slug})


class ProductImage(models.Model):
    image = ProcessedImageField(
        upload_to="products/",
        processors=[ResizeToFill(300, 200)],
        format="JPEG",
        options={"quality": 80},
    )
    product = models.ForeignKey(
        Product,
        verbose_name=_("product"),
        on_delete=models.CASCADE,
        related_name="images",
    )

    class Meta:
        verbose_name = _("product image")
        verbose_name_plural = _("product images")

    def __str__(self):
        return f"{self.product.name} - {self.image.name}"

    def get_absolute_url(self):
        return reverse("productimage-detail", kwargs={"pk": self.pk})
