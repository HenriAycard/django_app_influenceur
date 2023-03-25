from django.urls import path
from django.conf.urls import include
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
from api.views import *

urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='users_list'),
    path('user/<uuid:pk>/',  UserDetailView.as_view(), name='user_detail'),
    path('company/', CompanyCreateView.as_view(), name='company_create'),
    path('company/search/', CompanySearchView.as_view(), name='company_search'),
    path('company/<int:pk>', CompanyDetail.as_view(), name='company_detail'),
    path('imgCompany/', imgCompanyView.as_view(), name='imgCompany_create'),
    path('address/', AddressCreate.as_view(), name='address_list'),
    path('address/<int:pk>', AddressDetail.as_view(), name='address_detail'),
    path('opening/', OpeningCreate.as_view(), name='opening_list'),
    path('opening/<int:pk>', OpeningDetail.as_view(), name='opening_detail'),
    path('offer/', OfferCreateView.as_view(), name='offer_list'),
    path('offer/<int:pk>', OfferDetail.as_view(), name='offer_detail'),
    path('reservation/', ReservationCreateView.as_view(), name='reservation_list'),
    path('reservation/<int:pk>', ReservationDetail.as_view(), name='reservation_detail'),
    path('', include(router.urls))
]
