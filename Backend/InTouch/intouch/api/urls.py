from django.urls import path
from django.conf.urls import include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

urlpatterns = [
    path('register/', RegisterRequestView.as_view(), name='register_request'),
    path('users/', UserListCreateView.as_view(), name='users_list'),
    path('user/<uuid:pk>',  UserDetailView.as_view(), name='user_detail'),
    path('venue/', VenueCreateView.as_view(), name='venue_create'),
    path('venue/search/', VenueSearchView.as_view(), name='venue_search'),
    path('venue/<int:pk>', VenueDetail.as_view(), name='venue_detail'),
    path('venue/<int:pk>/analytics', VenueAnalyticsView.as_view(), name='venue_analytics'),
    path('venue/<int:pk>/view', VenueViewLogView.as_view(), name='venue_view_log'),
    path('influencer/analytics', InfluencerAnalyticsView.as_view(), name='influencer_analytics'),
    path('imgVenue/', ImgVenueListCreateView.as_view(), name='imgVenue_create'),
    path('imgVenue/<int:pk>', ImgVenueRetrieveUpdateDestroyView.as_view(), name='imgVenue_detail'),
    path('address/', AddressCreate.as_view(), name='address_list'),
    path('address/<int:pk>', AddressDetail.as_view(), name='address_detail'),
    path('opening/', OpeningCreate.as_view(), name='opening_list'),
    path('opening/<int:pk>', OpeningDetail.as_view(), name='opening_detail'),
    path('offer/', OfferCreateView.as_view(), name='offer_list'),
    path('offer/<int:pk>', OfferDetail.as_view(), name='offer_detail'),
    path('reservation/', ReservationCreateView.as_view(), name='reservation_list'),
    path('reservation/<int:pk>', ReservationDetail.as_view(), name='reservation_detail'),
    path('reservation/<int:pk>/contract.pdf', ContractPdfView.as_view(), name='reservation_contract'),
    path('reservation/<int:pk>/calendar.ics', ReservationIcsView.as_view(), name='reservation_ics'),
    path('review/', ReviewListCreateView.as_view(), name='review_list'),
    path('conversations/', ConversationListCreateView.as_view(), name='conversation_list'),
    path('conversations/unread-count/', UnreadMessagesCountView.as_view(), name='unread_count'),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view(), name='conversation_messages'),
    path('typeVenue/', TypeVenueView.as_view(), name='typeVenue_list'),
    path('save-fcm-token/', SaveFCMTokenView.as_view(), name='save_fcm_token'),
    path('', include(router.urls))
]