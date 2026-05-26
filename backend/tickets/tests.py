from types import SimpleNamespace

from django.test import SimpleTestCase

from tickets.permissions import IsOwnerOrStaffByRole, IsStaffByRole
from tickets.views import ALLOWED_STATUS_TRANSITIONS
from users.roles import ROLE_ADMIN, ROLE_OPERATOR


class _FakeGroupManager:
    def __init__(self, names):
        self._names = set(names)

    def filter(self, name__in):
        has_any = any(name in self._names for name in name__in)
        return SimpleNamespace(exists=lambda: has_any)


class _FakeUser:
    def __init__(self, *, is_authenticated=True, is_staff=False, is_superuser=False, groups=None):
        self.is_authenticated = is_authenticated
        self.is_staff = is_staff
        self.is_superuser = is_superuser
        self.groups = _FakeGroupManager(groups or [])


class TicketPermissionsTests(SimpleTestCase):
    def test_is_staff_by_role_accepts_operator_group(self):
        permission = IsStaffByRole()
        request = SimpleNamespace(user=_FakeUser(groups=[ROLE_OPERATOR]))

        self.assertTrue(permission.has_permission(request, None))

    def test_is_staff_by_role_rejects_regular_user(self):
        permission = IsStaffByRole()
        request = SimpleNamespace(user=_FakeUser(groups=["citizen"]))

        self.assertFalse(permission.has_permission(request, None))

    def test_owner_or_staff_allows_owner(self):
        permission = IsOwnerOrStaffByRole()
        owner = _FakeUser(groups=["citizen"])
        obj = SimpleNamespace(user=owner)
        request = SimpleNamespace(user=owner)

        self.assertTrue(permission.has_object_permission(request, None, obj))

    def test_owner_or_staff_allows_staff_role(self):
        permission = IsOwnerOrStaffByRole()
        owner = _FakeUser(groups=["citizen"])
        operator = _FakeUser(groups=[ROLE_ADMIN])
        obj = SimpleNamespace(user=owner)
        request = SimpleNamespace(user=operator)

        self.assertTrue(permission.has_object_permission(request, None, obj))


class TicketStatusWorkflowTests(SimpleTestCase):
    def test_terminal_statuses_have_no_outgoing_transitions(self):
        self.assertEqual(ALLOWED_STATUS_TRANSITIONS["COMPLETED"], set())
        self.assertEqual(ALLOWED_STATUS_TRANSITIONS["REJECTED"], set())

    def test_pending_review_can_move_only_to_in_progress_or_rejected(self):
        self.assertEqual(
            ALLOWED_STATUS_TRANSITIONS["PENDING_REVIEW"],
            {"IN_PROGRESS", "REJECTED"},
        )
