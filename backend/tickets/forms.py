from django import forms
from .models import Ticket
from django.contrib.gis.geos import Point


class TicketForm(forms.ModelForm):
    latitude = forms.FloatField(
        min_value=-90,
        max_value=90,
        required=True,
    )
    longitude = forms.FloatField(
        min_value=-180,
        max_value=180,
        required=True,
    )
    location = forms.HiddenInput()

    class Meta(object):
        model = Ticket
        exclude = []
        widgets = {
            "location": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if "location" in self.fields:
            self.fields["location"].required = False

        if self.instance and self.instance.pk and self.instance.location:
            self.fields["longitude"].initial = self.instance.location.x
            self.fields["latitude"].initial = self.instance.location.y

    def clean(self):
        cleaned_data = super().clean()
        latitude = cleaned_data.get("latitude")
        longitude = cleaned_data.get("longitude")
        cleaned_data["location"] = None

        if longitude is not None and latitude is not None:
            if not -180 <= longitude <= 180:
                self.add_error("longitude", "Longitude must be between -180 and 180.")
            if not -90 <= latitude <= 90:
                self.add_error("latitude", "Latitude must be between -90 and 90.")

            if not self.has_error("longitude") and not self.has_error("latitude"):
                cleaned_data["location"] = Point(longitude, latitude, srid=4326)

        return cleaned_data
