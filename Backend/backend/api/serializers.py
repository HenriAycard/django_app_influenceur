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

class AddressSerializer(ModelSerializer):

    class Meta:
        model = Address
        fields = '__all__'

class OpeningSerializer(ModelSerializer):

    class Meta:
        model = Opening
        fields = '__all__'

class TypeCompanySerializer(ModelSerializer):

    class Meta:
        model = TypeCompany
        fields = '__all__'


class imgCompanySerializer(ModelSerializer):
    
    class Meta:
        model = imgCompany
        fields = '__all__'

class CompanySerializer(ModelSerializer):
    user = UserSerializer(many=False, read_only=True)
    typeCompany = TypeCompanySerializer(many=False, read_only=True)
    imgCompany = imgCompanySerializer(many=True, read_only=True)
    class Meta:
        model = Company
        fields = ('id', 'nameCompany', 'isTakeAway', 'isOnSit', 'description', 'typeCompany', 'imgCompany', 'user')


class CompanyDetailsSerializer(ModelSerializer):
    address = AddressSerializer(many=False, read_only=True)
    typeCompany = TypeCompanySerializer(many=False, read_only=True)
    openings = OpeningSerializer(many=True)
    imgCompany = imgCompanySerializer(many=True, read_only=True)
    class Meta:
        model = Company
        fields = ('id', 'nameCompany', 'isTakeAway', 'isOnSit', 'description', 'address', 'typeCompany', 'openings', 'imgCompany')


class CompanyCreateSerializer(ModelSerializer):

    class Meta:
        model = Company
        fields = '__all__'

class OfferCreateSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class OfferSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class ReservationCompanySerializer(ModelSerializer):
    company = CompanySerializer(many=False, read_only=True)
    typeCompany = TypeCompanySerializer(many=False, read_only=True)
    class Meta:
        model = Company
        fields = '__all__'


class OfferCompanySerializer(ModelSerializer):
    company = ReservationCompanySerializer(many=False, read_only=True)
    class Meta:
        model = Offer
        fields = '__all__'

class ReservationSerializer(ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'


class InfluenceurReservationSerializer(ModelSerializer):
    offer = OfferCompanySerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'dateReservation')

class BrandReservationSerializer(ModelSerializer):
    offer = OfferCompanySerializer(many=False, read_only=True)
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'dateReservation', 'user')


