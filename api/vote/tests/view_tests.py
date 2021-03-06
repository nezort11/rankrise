import pytest
from rest_framework import status

from vote.models import Vote


@pytest.mark.django_db
class TestPermission:
    class TestAnonymous:
        def test_list(self, list_response):
            assert list_response.status_code == status.HTTP_200_OK

        def test_read(self, read_response):
            assert read_response.status_code == status.HTTP_200_OK

        def test_create(self, create_response):
            assert create_response.status_code == status.HTTP_401_UNAUTHORIZED

        def test_update(self, update_response):
            assert update_response.status_code == status.HTTP_401_UNAUTHORIZED

        def test_delete(self, delete_response):
            assert delete_response.status_code == status.HTTP_401_UNAUTHORIZED

    class TestUser:
        @pytest.fixture
        def client(self, user_client):
            return user_client

        def test_read(self, read_response):
            assert read_response.status_code == status.HTTP_200_OK

        def test_create(self, create_response):
            assert create_response.status_code == status.HTTP_201_CREATED

        def test_update(self, update_response):
            assert update_response.status_code == status.HTTP_200_OK

        def test_partial_update(self, update_partial_response):
            assert update_partial_response.status_code == status.HTTP_200_OK

        def test_delete(self, delete_response):
            assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    class TestAdmin:
        @pytest.fixture
        def client(self, admin_client):
            return admin_client

        def test_read(self, read_response):
            assert read_response.status_code == status.HTTP_200_OK

        def test_create(self, create_response):
            assert create_response.status_code == status.HTTP_201_CREATED

        def test_update(self, update_response):
            assert update_response.status_code == status.HTTP_200_OK

        def test_partial_update(self, update_partial_response):
            assert update_partial_response.status_code == status.HTTP_200_OK

        def test_delete(self, delete_response):
            assert delete_response.status_code == status.HTTP_204_NO_CONTENT


class TestRouter:
    @pytest.fixture
    def client(self, user_client):
        return user_client

    @pytest.fixture
    def list_url(self, q, o):
        return f"/api/questions/{q.pk}/options/{o.pk}/votes/"

    @pytest.fixture
    def detail_url(self, q, o, v):
        return f"/api/questions/{q.pk}/options/{o.pk}/votes/{v.pk}/"

    @pytest.fixture(
        params=[
            "list_response",
            "read_response",
            "create_response",
            "update_response",
            "update_partial_response",
            "delete_response",
        ]
    )
    def response(self, request):
        return request.getfixturevalue(request.param)

    def test_response(self, response):
        assert response.status_code != status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestAPI:
    @pytest.fixture
    def client(self, user_client):
        return user_client

    def test_list(self, v, list_response):
        assert len(list_response.data) == 1
        assert list_response.data[0]["pk"] == v.pk

    def test_read(self, v, read_response):
        assert read_response.data["pk"] == v.pk
        assert read_response.data["up"] == v.up
        assert read_response.data.get("option") is None
        assert read_response.data.get("user") is None

    def test_create(self, create_response, v_data):
        assert Vote.objects.count() == 1
        v = Vote.objects.latest()
        assert v.option.pk == v_data["option"]
        assert v.user.pk == v_data["user"]
        assert v.up == v_data["up"]

    def test_update(self, v, update_response):
        v = Vote.objects.get(pk=v.pk)
        assert v.up == False

    def test_partial_update(self, v, update_partial_response):
        v = Vote.objects.get(pk=v.pk)
        assert v.up == False

    def test_delete(self, v, delete_response):
        with pytest.raises(Vote.DoesNotExist):
            Vote.objects.get(pk=v.pk)


class TestFilters:
    pass
