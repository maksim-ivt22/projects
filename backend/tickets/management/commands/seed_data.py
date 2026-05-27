from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

from tickets.models import TicketCategory, TicketType
from users.models import User
from users.roles import ROLE_ADMIN, ROLE_CITIZEN


SEED_CATEGORIES = [
    {
        "title": "Дороги и тротуары",
        "score": 8,
        "types": [
            ("Яма на дороге", 9),
            ("Поврежденный тротуар", 8),
            ("Отсутствие пешеходного перехода", 8),
            ("Неубранный снег или лед", 7),
        ],
    },
    {
        "title": "Освещение",
        "score": 7,
        "types": [
            ("Не работает фонарь", 8),
            ("Недостаточное освещение", 7),
            ("Поврежденная опора освещения", 7),
        ],
    },
    {
        "title": "Мусор и санитарное состояние",
        "score": 6,
        "types": [
            ("Переполненная урна", 5),
            ("Несанкционированная свалка", 8),
            ("Мусор во дворе", 6),
            ("Неубранная территория", 6),
        ],
    },
    {
        "title": "Дворы и общественные пространства",
        "score": 6,
        "types": [
            ("Поврежденная детская площадка", 8),
            ("Сломанная скамейка", 5),
            ("Разбитое покрытие", 7),
            ("Неухоженная территория", 5),
        ],
    },
    {
        "title": "Озеленение",
        "score": 5,
        "types": [
            ("Сухое дерево", 7),
            ("Поврежденный газон", 5),
            ("Необходима посадка деревьев", 4),
            ("Заросшая территория", 4),
        ],
    },
    {
        "title": "Транспорт",
        "score": 7,
        "types": [
            ("Проблема с остановкой", 6),
            ("Отсутствие дорожного знака", 7),
            ("Поврежденный дорожный знак", 7),
            ("Проблема с парковкой", 5),
        ],
    },
    {
        "title": "Безопасность",
        "score": 9,
        "types": [
            ("Опасный участок", 9),
            ("Открытый люк", 10),
            ("Поврежденное ограждение", 8),
            ("Аварийный объект", 10),
        ],
    },
    {
        "title": "Другое",
        "score": 4,
        "types": [
            ("Другая проблема", 4),
            ("Предложение по благоустройству", 3),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed initial ticket categories/types and local admin user"

    def handle(self, *args, **options):
        created_categories = 0
        created_types = 0

        citizen_group, _ = Group.objects.get_or_create(name=ROLE_CITIZEN)
        admin_group, _ = Group.objects.get_or_create(name=ROLE_ADMIN)

        for category_data in SEED_CATEGORIES:
            category, category_created = TicketCategory.objects.get_or_create(
                title=category_data["title"],
                defaults={"score": category_data["score"]},
            )
            if category_created:
                created_categories += 1
            elif category.score != category_data["score"]:
                category.score = category_data["score"]
                category.save(update_fields=["score"])

            for type_title, type_score in category_data["types"]:
                ticket_type, type_created = TicketType.objects.get_or_create(
                    title=type_title,
                    category=category,
                    defaults={"score": type_score},
                )
                if type_created:
                    created_types += 1
                elif ticket_type.score != type_score:
                    ticket_type.score = type_score
                    ticket_type.save(update_fields=["score"])

        admin_email = "admin@example.com"
        admin_defaults = {
            "full_name": "Администратор",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }

        admin_user, admin_created = User.objects.get_or_create(
            email=admin_email,
            defaults=admin_defaults,
        )

        if admin_created:
            admin_user.set_password("admin12345")
            admin_user.save(update_fields=["password"])

        admin_updated_fields = []
        for key, value in admin_defaults.items():
            if getattr(admin_user, key) != value:
                setattr(admin_user, key, value)
                admin_updated_fields.append(key)

        if admin_updated_fields:
            admin_user.save(update_fields=admin_updated_fields)

        admin_user.groups.add(admin_group)
        admin_user.groups.add(citizen_group)

        self.stdout.write(self.style.SUCCESS("Seed completed."))
        self.stdout.write(
            f"Categories created: {created_categories}; Types created: {created_types}."
        )
        self.stdout.write(
            f"Admin user: {admin_user.email} ({'created' if admin_created else 'already exists'})."
        )
