from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

from patches import routers
from users.urls import auth_urlpatterns, router as users_router
from news.urls import router as news_router
from tickets.urls import router as tickets_router, ticket_category_urlpatterns

router = routers.DefaultRouter()
router.extend(users_router)
router.extend(tickets_router)
router.extend(news_router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("tickets/", include("tickets.urls", namespace="tickets")),
    path("auth/", include((auth_urlpatterns, "auth"), namespace="auth")),
    path(
        "ticket-categories/",
        include(
            (ticket_category_urlpatterns, "ticket-categories"),
            namespace="ticket-categories",
        ),
    ),
    path("", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
