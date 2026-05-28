import json
from unittest.mock import patch
from urllib.error import URLError

from django.conf import settings
from django.test import SimpleTestCase, override_settings
from django.urls import reverse


class ReverseGeocodeTests(SimpleTestCase):
    @override_settings(NOMINATIM_USER_AGENT="PagedCityTests/1.0")
    @patch("backend.views.urlopen")
    def test_reverse_geocode_proxies_nominatim_with_user_agent(self, mock_urlopen):
        class MockResponse:
            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, traceback):
                return False

            def read(self):
                return json.dumps({"address": {"road": "улица Ленина"}}).encode(
                    "utf-8"
                )

        mock_urlopen.return_value = MockResponse()

        response = self.client.get(
            reverse("geo-reverse"), {"lat": "62.016754", "lon": "129.70408"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["address"], "улица Ленина")

        upstream_request = mock_urlopen.call_args.args[0]
        self.assertIn("nominatim.openstreetmap.org/reverse", upstream_request.full_url)
        self.assertIn("lat=62.016754", upstream_request.full_url)
        self.assertIn("lon=129.70408", upstream_request.full_url)
        self.assertEqual(upstream_request.headers["User-agent"], "PagedCityTests/1.0")

    def test_reverse_geocode_validates_coordinates(self):
        response = self.client.get(
            reverse("geo-reverse"), {"lat": "bad", "lon": "129.70408"}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["address"], "Адрес не определён")

    @patch("backend.views.urlopen", side_effect=URLError("timeout"))
    def test_reverse_geocode_returns_fallback_on_upstream_error(self, _mock_urlopen):
        response = self.client.get(
            reverse("geo-reverse"), {"lat": "62.016754", "lon": "129.70408"}
        )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["address"], "Адрес не определён")


class RestFrameworkAuthenticationSettingsTests(SimpleTestCase):
    def test_api_uses_jwt_without_session_authentication(self):
        authentication_classes = settings.REST_FRAMEWORK[
            "DEFAULT_AUTHENTICATION_CLASSES"
        ]

        self.assertEqual(
            authentication_classes,
            ("rest_framework_simplejwt.authentication.JWTAuthentication",),
        )
        self.assertNotIn(
            "rest_framework.authentication.SessionAuthentication",
            authentication_classes,
        )
