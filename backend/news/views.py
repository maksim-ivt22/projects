from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsTag, Article
from .serializers import NewsTagSerializer, ArticleSerializer
from django.contrib.auth import get_user_model
from .permissions import IsStaffByRole

User = get_user_model()


class NewsTagViewSet(viewsets.ModelViewSet):
    queryset = NewsTag.objects.all()
    serializer_class = NewsTagSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["title"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffByRole()]


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["title", "content", "excerpt"]
    ordering_fields = ["published_at", "created_at", "updated_at", "views_count"]
    ordering = ["-published_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsStaffByRole()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save()
        return super().retrieve(request, *args, **kwargs)
