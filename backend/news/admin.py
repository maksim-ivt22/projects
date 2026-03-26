from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import NewsTag, Article


@admin.register(NewsTag)
class NewsTagAdmin(ModelAdmin):
    pass


@admin.register(Article)
class ArticleAdmin(ModelAdmin):
    pass
