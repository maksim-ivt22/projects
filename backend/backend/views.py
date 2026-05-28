import json
import logging
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
UNKNOWN_ADDRESS = "Адрес не определён"
ADDRESS_FIELDS_PRIORITY = (
    "road",
    "pedestrian",
    "footway",
    "path",
    "cycleway",
    "residential",
    "neighbourhood",
    "suburb",
    "city_district",
    "village",
    "town",
    "city",
)


def _parse_coordinate(value, name, minimum, maximum):
    try:
        coordinate = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"Параметр {name} должен быть числом")

    if not minimum <= coordinate <= maximum:
        raise ValueError(
            f"Параметр {name} должен быть в диапазоне от {minimum} до {maximum}"
        )

    return coordinate


def _extract_address(payload):
    address = payload.get("address") if isinstance(payload, dict) else None
    if isinstance(address, dict):
        for field in ADDRESS_FIELDS_PRIORITY:
            value = address.get(field)
            if isinstance(value, str) and value.strip():
                return value.strip()

    display_name = payload.get("display_name") if isinstance(payload, dict) else None
    if isinstance(display_name, str) and display_name.strip():
        return display_name.strip()

    return UNKNOWN_ADDRESS


@api_view(["GET"])
@permission_classes([AllowAny])
def reverse_geocode(request):
    try:
        lat = _parse_coordinate(request.query_params.get("lat"), "lat", -90, 90)
        lon = _parse_coordinate(request.query_params.get("lon"), "lon", -180, 180)
    except ValueError as exc:
        return Response(
            {"address": UNKNOWN_ADDRESS, "detail": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    query = urlencode(
        {
            "format": "jsonv2",
            "lat": lat,
            "lon": lon,
            "accept-language": request.query_params.get("accept-language", "ru"),
        }
    )
    user_agent = settings.NOMINATIM_USER_AGENT
    timeout = settings.NOMINATIM_TIMEOUT

    upstream_request = Request(
        f"{NOMINATIM_REVERSE_URL}?{query}",
        headers={
            "Accept": "application/json",
            "User-Agent": user_agent,
        },
    )

    try:
        with urlopen(upstream_request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        logger.warning("Nominatim reverse geocoding HTTP error: %s", exc.code)
        return Response(
            {"address": UNKNOWN_ADDRESS, "detail": "Не удалось определить адрес"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        logger.warning("Nominatim reverse geocoding failed: %s", exc)
        return Response(
            {"address": UNKNOWN_ADDRESS, "detail": "Не удалось определить адрес"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            "address": _extract_address(payload),
            "raw": payload,
        }
    )
