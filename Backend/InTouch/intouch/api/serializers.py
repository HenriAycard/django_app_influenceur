from .models import *
from rest_framework.serializers import ModelSerializer, SerializerMethodField, PrimaryKeyRelatedField, ValidationError, IntegerField
import uuid
from rest_framework import serializers

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
        fields = ('id', 'firstname', 'lastname', 'youtube', 'instagram', 'tiktok', 'is_influencer', 'is_company', 'avatar')

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
    type_company = TypeCompanySerializer(many=False, read_only=True)
    imgCompany = imgCompanySerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ('id', 'name_company', 'is_takeaway', 'is_onsit', 'description', 'type_company', 'imgCompany', 'user')


class CompanyDetailsSerializer(ModelSerializer):
    address = AddressSerializer(many=False, read_only=True)
    type_company = TypeCompanySerializer(many=False, read_only=True)
    type_company_id = PrimaryKeyRelatedField(
        queryset=TypeCompany.objects.all(),
        source='typeCompany',
        write_only=True,
    )
    address_id = PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source='address',
        write_only=True,
    )
    openings = OpeningSerializer(many=True)
    imgCompany = imgCompanySerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ('id', 'name_company', 'is_takeaway', 'is_onsit', 'description', 'address', 'address_id', 'type_company', 'type_company_id', 'openings', 'imgCompany', 'is_actif', 'facebook', 'tiktok', 'instagram', 'youtube', 'twitter')


class CompanyCreateSerializer(ModelSerializer):
    user = PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, required=False)


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
    imgCompany = imgCompanySerializer(many=True, read_only=True)
    type_company = TypeCompanySerializer(many=False, read_only=True)

    class Meta:
        model = Company
        fields = '__all__'


class OfferCompanySerializer(ModelSerializer):
    company = ReservationCompanySerializer(many=False, read_only=True)
    class Meta:
        model = Offer
        fields = '__all__'

class ReservationSerializer(ModelSerializer):
    offer_id = PrimaryKeyRelatedField(
        queryset=Offer.objects.all(), source="offer", write_only=True
    )
    offer = OfferCompanySerializer(many=False, read_only=True) # Keep for reading
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'offer_id', 'status', 'date_reservation', 'user')

class InfluenceurReservationSerializer(ModelSerializer):
    offer = OfferCompanySerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'date_reservation')

class BrandReservationSerializer(ModelSerializer):
    offer = OfferCompanySerializer(many=False, read_only=True)
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'date_reservation', 'user')

class FCMTokenSerializer(ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ['token']


class NotificationSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    title = serializers.CharField(max_length=255)
    body = serializers.CharField(max_length=1000)