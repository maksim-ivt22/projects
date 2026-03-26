from rest_framework import serializers

from users.serializers import UserSerializer
from .models import NewsTag, Article


class NewsTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsTag
        fields = ["id", "title"]


class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = NewsTagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "content",
            "excerpt",
            "author",
            "tags",
            "published_at",
            "created_at",
            "updated_at",
            "status",
            "is_featured",
            "image",
            "views_count",
        ]
        read_only_fields = ["views_count"]
