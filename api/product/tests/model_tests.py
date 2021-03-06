import pytest
from PIL import Image
from pathlib import Path
from django.core.files.uploadedfile import InMemoryUploadedFile, SimpleUploadedFile
from django.urls import reverse

from product.models import PriceChoices, Product, ProductImage
from category.models import Category


@pytest.fixture
def upload_test_image():
    """Create invalid in-memory image with image media type."""
    return SimpleUploadedFile(
        "image.png", b"some random image content", content_type="image/png"
    )


@pytest.fixture(scope="module")
def load_upload_file():
    with open(Path(__file__).parent / "media/sheep.png", "rb") as i:
        return SimpleUploadedFile("sheep.png", i.read(), content_type="image/png")


@pytest.mark.django_db
def test_can_create_product_with_fields():
    p = Product.objects.create(
        name="Python",
        description="Modern programming language",
        website="https://python.org",
    )
    p = Product.objects.get(pk=p.pk)

    assert p.name == "Python"
    assert p.slug == "python"
    assert p.description == "Modern programming language"
    assert p.website == "https://python.org"
    assert p.price == PriceChoices.FREE
    assert p.category == None


@pytest.fixture
def test_product():
    p = Product.objects.create(
        name="Python",
        description="Modern programming language",
        website="https://python.org",
        price=PriceChoices.OPEN_SOURCE,
    )
    return Product.objects.get(pk=p.pk)


@pytest.mark.django_db
def test_can_create_product_with_images(test_product, load_upload_file):
    p = test_product
    i = ProductImage.objects.create(image=load_upload_file, product=p)
    i = ProductImage.objects.get(pk=i.pk)

    with Image.open(i.image.path) as image:
        assert image.format.lower() == "jpeg"
        assert image.size == (300, 200)
    assert p.images.first().pk == i.pk


@pytest.mark.django_db
def test_get_alsolute_url():
    p = Product.objects.create(
        name="Python",
        description="Modern programming language",
        website="https://python.org",
    )
    assert p.get_absolute_url() == reverse("product-detail", kwargs={"slug": p.slug})


@pytest.fixture
def c():
    return Category.objects.create(name="Programming Languages")


@pytest.fixture
def p(c):
    return Product.objects.create(
        name="Python",
        description="Modern programming language",
        website="https://python.org",
        price=PriceChoices.OPEN_SOURCE,
        category=c,
    )


@pytest.fixture
def p2(c):
    return Product.objects.create(
        name="Python",
        description="Modern programming language",
        website="https://python.org",
        price=PriceChoices.OPEN_SOURCE,
    )


@pytest.mark.django_db
class TestCategory:
    def test_create_product_with_category(self, c, p):
        assert p.category.pk == c.pk

    def test_create_product_without_category(self, p2):
        assert p2.category == None

    def test_category_on_delete(self, c, p):
        c.delete()
        assert Product.objects.get(pk=p.pk).category == None

    def test_related_name(self, c, p):
        c.products.get(pk=p.pk)
