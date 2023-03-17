from backoffice.models import *
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions, serializers

#created by ionic django crud generator

class MethodField(SerializerMethodField):
    def __init__(self, method_name=None, **kwargs):
        # use kwargs for our function instead, not the base class
        super().__init__(method_name) 
        self.func_kwargs = kwargs

    def to_representation(self, value):
        method = getattr(self.parent, self.method_name)
        return method(value, **self.func_kwargs)

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'facebookId', 'android', 'ios', 'is_influenceur')

class CompanyCreateSerializer(ModelSerializer):

    class Meta:
        model = Company
        fields = '__all__'


class CompanySerializer(ModelSerializer):

    class Meta:
        model = Company
        fields = ('id', 'nameCompany')


class AddressSerializer(ModelSerializer):

    class Meta:
        model = Address
        fields = '__all__'

class OpeningSerializer(ModelSerializer):

    class Meta:
        model = Opening
        fields = '__all__'

class TypeActivitySerializer(ModelSerializer):

    class Meta:
        model = TypeActivity
        fields = '__all__'

class ActivitySerializer(ModelSerializer):
    company = CompanySerializer(many=False, read_only=True)
    address = AddressSerializer(many=False, read_only=True)
    typeActivity = TypeActivitySerializer(many=False, read_only=True)
    openings = OpeningSerializer(many=True)
    class Meta:
        model = Activity
        fields = ('id', 'nameActivity', 'isTakeAway', 'isOnSit', 'description', 'address', 'typeActivity', 'company', 'openings')

class ActivityCreateSerializer(ModelSerializer):

    class Meta:
        model = Activity
        fields = '__all__'

class OfferCreateSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class OfferSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class ReservationActivitySerializer(ModelSerializer):
    company = CompanySerializer(many=False, read_only=True)
    typeActivity = TypeActivitySerializer(many=False, read_only=True)
    class Meta:
        model = Activity
        fields = '__all__'


class OfferActivitySerializer(ModelSerializer):
    activity = ReservationActivitySerializer(many=False, read_only=True)
    class Meta:
        model = Offer
        fields = '__all__'

class ReservationSerializer(ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'


class InfluenceurReservationSerializer(ModelSerializer):
    offer = OfferActivitySerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'dateReservation')

class BrandReservationSerializer(ModelSerializer):
    offer = OfferActivitySerializer(many=False, read_only=True)
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'dateReservation', 'user')