from .models import *
from rest_framework.serializers import ModelSerializer, SerializerMethodField, PrimaryKeyRelatedField, ValidationError, IntegerField
import uuid
from rest_framework import serializers
from django.db.models import Avg, F
from django.utils import timezone

#created by ionic django crud generator


def _venue_rating(venue):
    """(average, count) of influencer-authored reviews for a venue."""
    qs = Review.objects.filter(reservation__offer__venue=venue, author=F('reservation__user'))
    agg = qs.aggregate(avg=Avg('rating'))
    return (round(agg['avg'], 1) if agg['avg'] is not None else None, qs.count())


def _influencer_rating(user):
    """(average, count) of brand-authored reviews targeting an influencer."""
    qs = Review.objects.filter(reservation__user=user).exclude(author=F('reservation__user'))
    agg = qs.aggregate(avg=Avg('rating'))
    return (round(agg['avg'], 1) if agg['avg'] is not None else None, qs.count())

class MethodField(SerializerMethodField):
    def __init__(self, method_name=None, **kwargs):
        # use kwargs for our function instead, not the base class
        super().__init__(method_name) 
        self.func_kwargs = kwargs

    def to_representation(self, value):
        method = getattr(self.parent, self.method_name)
        return method(value, **self.func_kwargs)

class UserSerializer(ModelSerializer):
    average_rating = SerializerMethodField()
    review_count = SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'firstname', 'lastname', 'youtube', 'instagram', 'tiktok', 'is_influencer', 'is_company', 'avatar', 'instagram_followers', 'tiktok_followers', 'youtube_followers', 'email_notifications', 'average_rating', 'review_count')
        # Roles are assigned out-of-band; a user must not be able to switch
        # sides of the marketplace by patching their own profile.
        read_only_fields = ('is_influencer', 'is_company')

    def get_average_rating(self, obj):
        return _influencer_rating(obj)[0]

    def get_review_count(self, obj):
        return _influencer_rating(obj)[1]

class AddressSerializer(ModelSerializer):

    class Meta:
        model = Address
        fields = '__all__'

class OpeningSerializer(ModelSerializer):

    class Meta:
        model = Opening
        fields = '__all__'

class TypeVenueSerializer(ModelSerializer):

    class Meta:
        model = TypeVenue
        fields = '__all__'


class imgVenueSerializer(ModelSerializer):
    
    class Meta:
        model = imgVenue
        fields = '__all__'

class VenueSerializer(ModelSerializer):
    user = UserSerializer(many=False, read_only=True)
    type_venue = TypeVenueSerializer(many=False, read_only=True)
    imgVenue = imgVenueSerializer(many=True, read_only=True)
    average_rating = SerializerMethodField()
    review_count = SerializerMethodField()

    class Meta:
        model = Venue
        fields = ('id', 'name_venue', 'is_takeaway', 'is_onsit', 'description', 'type_venue', 'imgVenue', 'user', 'average_rating', 'review_count')

    def get_average_rating(self, obj):
        return _venue_rating(obj)[0]

    def get_review_count(self, obj):
        return _venue_rating(obj)[1]


class VenueDetailsSerializer(ModelSerializer):
    address = AddressSerializer(many=False, read_only=True)
    type_venue = TypeVenueSerializer(many=False, read_only=True)
    type_venue_id = PrimaryKeyRelatedField(
        queryset=TypeVenue.objects.all(),
        source='typeVenue',
        write_only=True,
    )
    address_id = PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source='address',
        write_only=True,
    )
    openings = OpeningSerializer(many=True)
    imgVenue = imgVenueSerializer(many=True, read_only=True)
    average_rating = SerializerMethodField()
    review_count = SerializerMethodField()

    class Meta:
        model = Venue
        fields = ('id', 'name_venue', 'is_takeaway', 'is_onsit', 'description', 'address', 'address_id', 'type_venue', 'type_venue_id', 'openings', 'imgVenue', 'is_actif', 'facebook', 'tiktok', 'instagram', 'youtube', 'twitter', 'average_rating', 'review_count')

    def get_average_rating(self, obj):
        return _venue_rating(obj)[0]

    def get_review_count(self, obj):
        return _venue_rating(obj)[1]


class VenueCreateSerializer(ModelSerializer):
    user = PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, required=False)


    class Meta:
        model = Venue
        fields = '__all__'

class OfferCreateSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class OfferSerializer(ModelSerializer):

    class Meta:
        model = Offer
        fields = '__all__'

class ReservationVenueSerializer(ModelSerializer):
    imgVenue = imgVenueSerializer(many=True, read_only=True)
    type_venue = TypeVenueSerializer(many=False, read_only=True)

    class Meta:
        model = Venue
        fields = '__all__'


class OfferVenueSerializer(ModelSerializer):
    venue = ReservationVenueSerializer(many=False, read_only=True)
    class Meta:
        model = Offer
        fields = '__all__'

class ReviewSerializer(ModelSerializer):
    author = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'rating', 'comment', 'created', 'author')


def _reservation_completed(reservation):
    """ACCEPTED (status 1) and its date has passed."""
    return (
        reservation.status == 1
        and reservation.date_reservation is not None
        and reservation.date_reservation < timezone.now()
    )


class ReservationSerializer(ModelSerializer):
    offer_id = PrimaryKeyRelatedField(
        queryset=Offer.objects.all(), source="offer", write_only=True
    )
    offer = OfferVenueSerializer(many=False, read_only=True) # Keep for reading
    user = UserSerializer(many=False, read_only=True)
    my_review = SerializerMethodField()
    can_review = SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'offer_id', 'status', 'date_reservation', 'user', 'my_review', 'can_review')

    def _viewer(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user is not None and user.is_authenticated else None

    def get_my_review(self, obj):
        viewer = self._viewer()
        if not viewer:
            return None
        review = obj.reviews.filter(author=viewer).first()
        return ReviewSerializer(review).data if review else None

    def get_can_review(self, obj):
        viewer = self._viewer()
        if not viewer:
            return False
        is_party = obj.user_id == viewer.id or obj.offer.venue.user_id == viewer.id
        already = obj.reviews.filter(author=viewer).exists()
        return is_party and _reservation_completed(obj) and not already

class InfluenceurReservationSerializer(ModelSerializer):
    offer = OfferVenueSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'date_reservation')

class BrandReservationSerializer(ModelSerializer):
    offer = OfferVenueSerializer(many=False, read_only=True)
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'offer', 'status', 'date_reservation', 'user')

class ReviewCreateSerializer(ModelSerializer):
    reservation_id = PrimaryKeyRelatedField(
        queryset=Reservation.objects.all(), source='reservation', write_only=True
    )

    class Meta:
        model = Review
        fields = ('id', 'rating', 'comment', 'reservation_id')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise ValidationError('Rating must be between 1 and 5.')
        return value


class FCMTokenSerializer(ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ['token']


class RegisterRequestSerializer(serializers.Serializer):
    """Application to join: identity + role; influencers must provide at
    least one social handle so the reviewer can check the profile."""
    email = serializers.EmailField()
    firstname = serializers.CharField(max_length=100)
    lastname = serializers.CharField(max_length=100)
    role = serializers.ChoiceField(choices=('influencer', 'venue'))
    instagram = serializers.CharField(max_length=100, required=False, allow_blank=True)
    tiktok = serializers.CharField(max_length=100, required=False, allow_blank=True)
    youtube = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['role'] == 'influencer' and not any(
            (attrs.get(n) or '').strip() for n in ('instagram', 'tiktok', 'youtube')
        ):
            raise ValidationError(
                {'detail': 'Please provide at least one social media handle.'}
            )
        return attrs


class ChatUserSerializer(ModelSerializer):
    """Minimal user shape for chat (avoids the rating aggregates of UserSerializer)."""
    class Meta:
        model = User
        fields = ('id', 'firstname', 'lastname', 'avatar')


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'sender', 'body', 'created_at', 'read_at')
        read_only_fields = ('id', 'sender', 'created_at', 'read_at')


class ConversationSerializer(ModelSerializer):
    """Viewer-aware: the influencer sees the venue (name + image); the brand sees
    the influencer (name + avatar) with the venue as a subtitle."""
    title = SerializerMethodField()
    subtitle = SerializerMethodField()
    avatar = SerializerMethodField()
    last_message = SerializerMethodField()
    unread_count = SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'title', 'subtitle', 'avatar', 'last_message', 'unread_count', 'updated_at')

    def _me(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user is not None and user.is_authenticated else None

    def _influencer_side(self, obj):
        me = self._me()
        return bool(me and me.id == obj.influencer_id)

    def _abs(self, field):
        if not field:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(field.url) if request else field.url

    def get_title(self, obj):
        if self._influencer_side(obj):
            return obj.venue.name_venue
        return f"{obj.influencer.firstname} {obj.influencer.lastname}".strip()

    def get_subtitle(self, obj):
        # The brand sees which venue the thread is about; the influencer doesn't need it.
        return None if self._influencer_side(obj) else obj.venue.name_venue

    def get_avatar(self, obj):
        if self._influencer_side(obj):
            img = obj.venue.imgVenue.filter(is_principal=True).first() or obj.venue.imgVenue.first()
            return self._abs(img.file) if img else None
        return self._abs(obj.influencer.avatar)

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        me = self._me()
        if not me:
            return 0
        return obj.messages.filter(read_at__isnull=True).exclude(sender=me).count()