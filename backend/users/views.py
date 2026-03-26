from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.models import Group
from rest_framework import permissions, viewsets

from .models import User
from .serializers import GroupSerializer, UserRegistrationSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]


class UserRegisterView(generics.CreateAPIView):
    """
    API view for user registration. Accepts POST requests with user data.
    """

    queryset = User.objects.all()  # Required for CreateAPIView, can be empty queryset
    permission_classes = (permissions.AllowAny,)  # Anyone can register
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to return user data using
        UserSerializer upon successful registration.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Calls serializer.create()

        # Optionally, serialize the created user with a different serializer for the response
        response_serializer = UserSerializer(
            user, context=self.get_serializer_context()
        )

        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CurrentUserView(generics.GenericAPIView):  # Or inherit from APIView
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        """
        Determine the current user by their token, and return their data
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
