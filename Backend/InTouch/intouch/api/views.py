from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, DateTimeFilter
from django.contrib.postgres.search import SearchVector, SearchQuery

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import generics, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser, FileUploadParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError

from django.db.models import F, Q

from .models import *
from .serializers import *
from .serializers import _venue_rating, _influencer_rating  # underscore names skip `import *`
from .permissions import IsVenueOwner, IsRelatedToVenueOwner, IsReservationParty

import logging
from uuid import UUID
from datetime import datetime
from django.utils import timezone
from firebase_admin import messaging

logger = logging.getLogger(__name__)


def _notify(user_id, title, body):
    """Best-effort FCM push. Never raises: a missing token or a send failure
    must not break the action (reservation create/update) that triggered it."""
    try:
        fcm = FCMToken.objects.filter(user_id=user_id).first()
        if not fcm:
            return
        messaging.send(messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=fcm.token,
        ))
    except Exception as e:
        logger.warning("FCM push to %s failed: %s", user_id, e)


# Create your views here.

class UserListCreateView(generics.ListCreateAPIView):
    """
            get:
                Search or get users
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['password','last_login','is_superuser','id','email','firstname','lastname','is_active']
    swagger_schema = None
    pagination_class = None
         # Filter for connected user
    def get_queryset(self):
            user = self.request.user
            queryset = User.objects.filter(pk=user.id)
            return queryset

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
            get:
                get a specific user
            delete:
                Remove an existing user.
            patch:
                Update one or more fields on an existing user.
            put:
                Update a user.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    swagger_schema = None
    pagination_class = None
         # Filter for connected user
    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.filter(pk=user.id)
        return queryset

class VenueCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VenueCreateSerializer
        return VenueSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Validate properly
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        print(user)

        if user.is_influencer == 0:
            queryset = Venue.objects.filter(user_id=user.id, user__is_influencer=user.is_influencer, is_actif=1).order_by('id')
        else:
            queryset = Venue.objects.all().order_by('id')
        return queryset

class VenueSearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VenueSerializer
    swagger_schema = None

    def get_queryset(self):
        query = self.request.GET.get('search')
        query = "|".join(query.split(' ')) #joining the space separated words with | for OR condition

        search_query = SearchQuery(query, search_type='raw')
        search_vector = SearchVector('name_venue', weight='A') + SearchVector('description', weight='B') + SearchVector('address__city', weight='C')

        brands = Venue.objects.annotate(
            search=search_vector,
            rank=SearchVector(search_vector, search_query)
        ).filter(search=search_query).order_by("-rank")

        return brands


class VenueDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsVenueOwner]
    queryset = Venue.objects.all()
    serializer_class = VenueDetailsSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        print(user)

        if user.is_influencer == 0:
            queryset = Venue.objects.filter(user_id=user.id)
        else:
            queryset = Venue.objects.all()
        return queryset


class AddressCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

class AddressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRelatedToVenueOwner]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

class OpeningCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Opening.objects.all()
    serializer_class = OpeningSerializer

class OpeningDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRelatedToVenueOwner]
    queryset = Opening.objects.all()
    serializer_class = OpeningSerializer

class OfferCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OfferCreateSerializer
        return OfferSerializer

    def get_queryset(self):
        venue = self.request.query_params['venue']
        queryset = Offer.objects.filter(venue_id=venue).order_by('id')
        return queryset

class OfferDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRelatedToVenueOwner]
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

class ReservationFilter(FilterSet):
    from_reservation = DateTimeFilter(field_name='date_reservation', lookup_expr='gte')
    to_reservation = DateTimeFilter(field_name='date_reservation', lookup_expr='lte')

    class Meta:
        model = Reservation
        fields = ['status', 'date_reservation', 'user']

class ReservationCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reservation.objects.all()
    pagination_class = None
    swagger_schema = None

    def get_serializer_class(self):
        if self.request.method == 'GET':
            if self.request.user.is_influencer:
                return InfluenceurReservationSerializer
            else:
                return BrandReservationSerializer
        return ReservationSerializer
    
    def create(self, request, *args, **kwargs):
        request.data['status'] = 0  # Default status
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Validate properly

        # Eligibility gate: an offer may require a minimum follower count per
        # network (#4). The influencer must meet every requirement the offer sets.
        offer = serializer.validated_data['offer']
        user = request.user
        requirements = [
            ('Instagram', offer.min_followers_instagram, user.instagram_followers),
            ('TikTok', offer.min_followers_tiktok, user.tiktok_followers),
            ('YouTube', offer.min_followers_youtube, user.youtube_followers),
        ]
        unmet = [f"{name} ({req:,})" for name, req, have in requirements if req and (have or 0) < req]
        if unmet:
            return Response(
                {"detail": "This collaboration requires at least: " + ", ".join(unmet) + " followers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_create(serializer)

        # Best-effort: alert the venue owner (brand) that a new application came
        # in. A missing token must never fail the application itself (the old
        # code returned 400 here, discarding an already-created reservation).
        reservation = serializer.instance
        _notify(reservation.offer.venue.user_id, "New application",
                "An influencer applied to one of your offers.")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = Reservation.objects.all()
        user = self.request.user

        # Get query parameters only once
        status_resa = self.request.query_params.get('status')
        from_date_resa = self.request.query_params.get('from_date')
        to_date_resa = self.request.query_params.get('to_date')

        # Determine if the user is an influencer or not
        if user.is_influencer:
            filter_params = {'user': user.id}
        else:
            filter_params = {'offer__venue__user_id': user.id}
        
        # Apply filters based on status and date range
        if status_resa:
            filter_params['status'] = status_resa
        
        if from_date_resa:
            filter_params['date_reservation__gte'] = timezone.make_aware(
                datetime.strptime(from_date_resa, '%Y-%m-%d')
            )

        if to_date_resa:
            filter_params['date_reservation__lt'] = timezone.make_aware(
                datetime.strptime(to_date_resa, '%Y-%m-%d')
            )

        # Apply filters and return the result
        return queryset.filter(**filter_params).order_by('date_reservation')

class ReservationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsReservationParty]
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        reservation = serializer.save()
        # When the brand accepts/declines, tell the influencer (best-effort).
        if reservation.status != previous_status:
            if reservation.status == 1:
                _notify(reservation.user_id, "Application accepted",
                        "Your collaboration was accepted!")
            elif reservation.status == 2:
                _notify(reservation.user_id, "Application declined",
                        "Your application was not selected this time.")


#class imgVenueView(APIView):
#    permission_classes = [permissions.IsAuthenticated]
#    parser_class = (MultiPartParser, FormParser)
#    serializer_class = imgVenueSerializer

#    def post(self, request, *args, **kwargs):
#      file_serializer = imgVenueSerializer(data=request.data)
#      if file_serializer.is_valid():
#          file_serializer.save()
#          return Response(file_serializer.data, status=status.HTTP_201_CREATED)
#      else:
#          print(file_serializer.errors)
#          return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImgVenueListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = imgVenueSerializer
    queryset = imgVenue.objects.all().order_by('id')

class ImgVenueRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRelatedToVenueOwner]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = imgVenueSerializer
    queryset = imgVenue.objects.all()

class TypeVenueView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = TypeVenue.objects.all().order_by('id')
    serializer_class = TypeVenueSerializer
    pagination_class = None

class ReviewListCreateView(generics.ListCreateAPIView):
    """List reviews for a venue (?venue=) or an influencer (?influencer=),
    and create a review for a completed collaboration the user took part in."""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        return ReviewCreateSerializer if self.request.method == 'POST' else ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.select_related('author').order_by('-created')
        venue = self.request.query_params.get('venue')
        influencer = self.request.query_params.get('influencer')
        if venue:
            return qs.filter(reservation__offer__venue_id=venue, author=F('reservation__user'))
        if influencer:
            return qs.filter(reservation__user_id=influencer).exclude(author=F('reservation__user'))
        return qs.none()

    def perform_create(self, serializer):
        reservation = serializer.validated_data['reservation']
        user = self.request.user

        is_party = reservation.user_id == user.id or reservation.offer.venue.user_id == user.id
        completed = (
            reservation.status == 1
            and reservation.date_reservation is not None
            and reservation.date_reservation < timezone.now()
        )
        if not is_party:
            raise PermissionDenied('You are not part of this collaboration.')
        if not completed:
            raise DRFValidationError('You can only review a completed collaboration.')
        if Review.objects.filter(reservation=reservation, author=user).exists():
            raise DRFValidationError('You have already reviewed this collaboration.')

        serializer.save(author=user)


class SaveFCMTokenView(generics.UpdateAPIView):
    serializer_class = FCMTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        token = request.data.get('token')

        if not token:
            return Response({'error': 'Token is required'}, status=400)
        
        # Check if the token already exists
        existing_token = FCMToken.objects.filter(token=token).first()
        if existing_token:
            # Delete the old token if it exists
            existing_token.delete()

        # Store or update the FCM token for the logged-in user
        obj, created = FCMToken.objects.update_or_create(
            user=request.user, defaults={'token': token}
        )

        return Response({'message': 'FCM Token saved successfully', 'created': created})


@api_view(['POST'])
def send_push_notification(request):
    # Serialize and validate the incoming data
    serializer = NotificationSerializer(data=request.data)
    if serializer.is_valid():
        user_id = serializer.validated_data['user_id']
        title = serializer.validated_data['title']
        body = serializer.validated_data['body']

        try:
            # Convert user_id to UUID to query the database            
            # Retrieve the FCM token for the user
            fcm_token = FCMToken.objects.get(user_id=user_id).token
            if not fcm_token:
                return Response({"error": "FCM token not found for user"}, status=status.HTTP_404_NOT_FOUND)

            # Create the message payload
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                token=fcm_token
            )

            # Send the message using Firebase Admin SDK
            response = messaging.send(message)

            # Return response
            return Response(
                {"status": "Notification sent", "response": response},
                status=status.HTTP_200_OK
            )

        except FCMToken.DoesNotExist:
            return Response({"error": "FCM token not found for user"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "Invalid UUID format for user_id"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Analytics — venue (chantier #5) & influencer (chantier #6)
# ---------------------------------------------------------------------------

def _acceptance_rate(accepted, declined):
    """Accepted share of decided (accepted + declined) applications, 0-100 int."""
    decided = accepted + declined
    return round(accepted / decided * 100) if decided else None


class VenueAnalyticsView(APIView):
    """Per-venue stats for the owning brand: applications funnel, partnerships
    realized, distinct influencers received, page views, rating."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        venue = get_object_or_404(Venue, pk=pk)
        if venue.user_id != request.user.id:
            raise PermissionDenied('You do not own this venue.')

        now = timezone.now()
        reservations = Reservation.objects.filter(offer__venue_id=pk)
        accepted = reservations.filter(status=1).count()
        declined = reservations.filter(status=2).count()
        completed = reservations.filter(status=1, date_reservation__lt=now)
        avg_rating, review_count = _venue_rating(venue)

        return Response({
            'applications_total': reservations.count(),
            'pending': reservations.filter(status=0).count(),
            'accepted': accepted,
            'declined': declined,
            'acceptance_rate': _acceptance_rate(accepted, declined),
            'partnerships_completed': completed.count(),
            'upcoming': reservations.filter(status=1, date_reservation__gte=now).count(),
            'influencers_received': completed.values('user').distinct().count(),
            'active_offers': Offer.objects.filter(venue_id=pk).filter(
                Q(end_date__gte=now.date()) | Q(end_date__isnull=True)
            ).count(),
            'page_views': VenueView.objects.filter(venue_id=pk).count(),
            'unique_visitors': VenueView.objects.filter(venue_id=pk)
                .exclude(user__isnull=True).values('user').distinct().count(),
            'average_rating': avg_rating,
            'review_count': review_count,
        })


class InfluencerAnalyticsView(APIView):
    """Stats for the authenticated influencer: applications funnel, realized
    collaborations, distinct venues visited, rating received."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        reservations = Reservation.objects.filter(user=user)
        accepted = reservations.filter(status=1).count()
        declined = reservations.filter(status=2).count()
        completed = reservations.filter(status=1, date_reservation__lt=now)
        avg_rating, review_count = _influencer_rating(user)

        return Response({
            'applications_sent': reservations.count(),
            'pending': reservations.filter(status=0).count(),
            'accepted': accepted,
            'declined': declined,
            'acceptance_rate': _acceptance_rate(accepted, declined),
            'collaborations_realized': completed.count(),
            'upcoming': reservations.filter(status=1, date_reservation__gte=now).count(),
            'venues_visited': completed.values('offer__venue').distinct().count(),
            'average_rating': avg_rating,
            'review_count': review_count,
        })


class VenueViewLogView(APIView):
    """Records one influencer visit of a venue page (the owner's own visits are
    skipped). Fire-and-forget from the venue page; always returns 204."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        venue = get_object_or_404(Venue, pk=pk)
        if venue.user_id != request.user.id:
            VenueView.objects.create(venue=venue, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContractPdfView(APIView):
    """Renders a designed PDF collaboration agreement for an accepted
    reservation (chantier #8). Restricted to the two parties."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        reservation = get_object_or_404(
            Reservation.objects.select_related('offer__venue__user', 'offer__venue__address', 'user'),
            pk=pk,
        )
        is_party = (
            reservation.user_id == request.user.id
            or reservation.offer.venue.user_id == request.user.id
        )
        if not is_party:
            raise PermissionDenied('You are not part of this collaboration.')
        if reservation.status != 1:
            return Response(
                {"detail": "The contract is available once the collaboration is accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        import weasyprint  # local import: keeps module import cheap and optional
        html = render_to_string('contract.html', {
            'reservation': reservation,
            'offer': reservation.offer,
            'venue': reservation.offer.venue,
            'influencer': reservation.user,
            'brand': reservation.offer.venue.user,
            'generated': timezone.now(),
        })
        pdf = weasyprint.HTML(string=html).write_pdf()
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="intouch-contract-{reservation.id}.pdf"'
        return response


# ---------------------------------------------------------------------------
# Messaging (Postgres + DRF; Firebase only alerts the recipient out-of-app)
# ---------------------------------------------------------------------------

class ConversationListCreateView(generics.ListCreateAPIView):
    """List my conversations (newest first), or open/get the thread for a venue.

    POST body: `venue_id` (required). When the caller owns the venue (brand side),
    `user_id` (the influencer) is also required; otherwise the caller is the
    influencer party."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer
    pagination_class = None

    def get_queryset(self):
        me = self.request.user
        return (Conversation.objects
                .filter(Q(influencer=me) | Q(venue__user=me))
                .select_related('venue', 'influencer')
                .order_by('-updated_at'))

    def create(self, request, *args, **kwargs):
        venue_id = request.data.get('venue_id')
        if not venue_id:
            return Response({"detail": "venue_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        venue = get_object_or_404(Venue, pk=venue_id)

        if request.user.id == venue.user_id:
            influencer_id = request.data.get('user_id')
            if not influencer_id:
                return Response({"detail": "user_id (influencer) is required."}, status=status.HTTP_400_BAD_REQUEST)
            influencer = get_object_or_404(User, pk=influencer_id)
        else:
            influencer = request.user

        conversation, _ = Conversation.objects.get_or_create(influencer=influencer, venue=venue)
        return Response(self.get_serializer(conversation).data, status=status.HTTP_200_OK)


class MessageListCreateView(generics.ListCreateAPIView):
    """Messages within a conversation the requester takes part in (the influencer
    or the venue's owner)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None

    def _conversation(self):
        conversation = get_object_or_404(
            Conversation.objects.select_related('venue', 'influencer'), pk=self.kwargs['pk']
        )
        if self.request.user.id not in (conversation.influencer_id, conversation.venue.user_id):
            raise PermissionDenied('You are not part of this conversation.')
        return conversation

    def get_queryset(self):
        conversation = self._conversation()
        # Opening the thread marks the other party's messages as read.
        conversation.messages.filter(read_at__isnull=True).exclude(
            sender=self.request.user
        ).update(read_at=timezone.now())
        return conversation.messages.all()

    def create(self, request, *args, **kwargs):
        conversation = self._conversation()
        body = (request.data.get('body') or '').strip()
        if not body:
            return Response({"detail": "Message body is required."}, status=status.HTTP_400_BAD_REQUEST)
        message = Message.objects.create(conversation=conversation, sender=request.user, body=body)
        Conversation.objects.filter(pk=conversation.pk).update(updated_at=timezone.now())

        # Notify the other party; the sender is labelled from their perspective.
        if request.user.id == conversation.influencer_id:
            recipient_id = conversation.venue.user_id
            sender_label = request.user.firstname or 'Someone'
        else:
            recipient_id = conversation.influencer_id
            sender_label = conversation.venue.name_venue or 'A venue'
        _notify(recipient_id, f"New message from {sender_label}", body[:120])
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class UnreadMessagesCountView(APIView):
    """Total unread messages addressed to me (for the Messages tab badge)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        me = request.user
        count = Message.objects.filter(
            Q(conversation__influencer=me) | Q(conversation__venue__user=me),
            read_at__isnull=True,
        ).exclude(sender=me).count()
        return Response({"count": count})