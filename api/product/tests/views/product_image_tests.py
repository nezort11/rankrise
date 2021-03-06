import pytest
from pathlib import Path
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from product.serializers import ProductSerializer
from product.models import Product, ProductImage


@pytest.fixture
def product_image_list_url_name():
    return "productimage-list"


@pytest.fixture
def product():
    return Product.objects.create(name="Python")


@pytest.fixture
def product2():
    return Product.objects.create(name="JS")


@pytest.fixture
def load_upload_file():
    with open(Path(__file__).parent.parent / "media/sheep.png", "rb") as i:
        return SimpleUploadedFile("sheep.png", i.read(), content_type="image/png")


@pytest.fixture
def load_upload_file2():
    with open(Path(__file__).parent.parent / "media/turtle.png", "rb") as i:
        return SimpleUploadedFile("turtle.png", i.read(), content_type="image/png")


@pytest.fixture
def setup_data(load_upload_file, product):
    return [ProductImage.objects.create(image=load_upload_file, product=product)]


@pytest.fixture
def act_list(product_image_list_url_name):
    return lambda client, setup_data: client.get(reverse(product_image_list_url_name))


@pytest.fixture
def act_retrieve():
    return lambda client, setup_data: client.get(setup_data[0].get_absolute_url())


@pytest.fixture
def act_create(product_image_list_url_name, load_upload_file2):
    return lambda client, setup_data: client.post(
        reverse(product_image_list_url_name),
        {"image": load_upload_file2, "product": setup_data[0].product.pk},
    )


@pytest.fixture
def act_update(load_upload_file2, product2):
    return lambda client, setup_data: client.put(
        setup_data[0].get_absolute_url(),
        {"image": load_upload_file2, "product": product2},
    )


@pytest.fixture
def act_partial_update():
    return lambda client, setup_data: client.patch(
        setup_data[0].get_absolute_url(),
        {"name": "Ruby"},
    )


@pytest.fixture
def act_delete():
    return lambda client, setup_data: client.delete(setup_data[0].get_absolute_url())


class TestUnAuthenticated:
    @pytest.mark.django_db
    def test_list(self, setup_data, act_list, anonymous_api_client):
        response = act_list(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.django_db
    def test_retrieve(self, setup_data, act_retrieve, anonymous_api_client):
        response = act_retrieve(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["pk"] == setup_data[0].pk

    @pytest.mark.django_db
    def test_create(self, setup_data, act_create, anonymous_api_client):
        response = act_create(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    def test_update(self, setup_data, act_update, anonymous_api_client):
        response = act_update(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    def test_partial_update(self, setup_data, act_partial_update, anonymous_api_client):
        response = act_partial_update(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    def test_delete(self, setup_data, act_delete, anonymous_api_client):
        response = act_delete(anonymous_api_client, setup_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestAuthenticated:
    @pytest.mark.django_db
    def test_create(self, setup_data, act_create, authenticated_api_client):
        response = act_create(authenticated_api_client, setup_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["pk"] == ProductImage.objects.last().pk

    @pytest.mark.django_db
    def test_update(self, setup_data, act_update, authenticated_api_client):
        response = act_update(authenticated_api_client, setup_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    def test_partial_update(
        self, setup_data, act_partial_update, authenticated_api_client
    ):
        response = act_partial_update(authenticated_api_client, setup_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    def test_delete(self, setup_data, act_delete, authenticated_api_client):
        response = act_delete(authenticated_api_client, setup_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestStaff:
    @pytest.mark.django_db
    def test_update(self, setup_data, act_update, staff_api_client):
        response = act_update(staff_api_client, setup_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    def test_partial_update(self, setup_data, act_partial_update, staff_api_client):
        response = act_partial_update(staff_api_client, setup_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    def test_delete(self, setup_data, act_delete, staff_api_client):
        response = act_delete(staff_api_client, setup_data)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        with pytest.raises(ProductImage.DoesNotExist):
            ProductImage.objects.get(pk=setup_data[0].pk)


class TestCommunityTrottle:
    pass
