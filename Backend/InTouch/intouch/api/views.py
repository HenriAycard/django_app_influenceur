from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django_filters import FilterSet, DateTimeFilter
from django.contrib.postgres.search import SearchVector, SearchQuery

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import generics, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser, FileUploadParser
from rest_framework.response import Response

from .models import *
from .serializers import *

import logging

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
    filterset_fields = ['password','last_login','is_superuser','id','email','first_name','last_name','is_active']
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

'''
class CompanyDetailView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanySerializer
    def get_queryset(self):
        user = self.request.user
        queryset = Company.objects.filter(user_id=user.id)
        return queryset

class CompanyCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanyCreateSerializer

    def create(self, request, *args, **kwargs):
        request.data['user'] = str(self.request.user.id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        serializer.save()
'''

class CompanyCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CompanyCreateSerializer
        return CompanySerializer

    def create(self, request, *args, **kwargs):
        request.data['user'] = str(self.request.user.id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        print(user)

        if user.is_influencer == 0:
            queryset = Company.objects.filter(user_id=user.id, user__is_influencer=user.is_influencer, isCompanyActif=1)
        else:
            queryset = Company.objects.all()
        return queryset

class CompanySearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanySerializer
    swagger_schema = None

    def get_queryset(self):
        query = self.request.GET.get('search')
        query = "|".join(query.split(' ')) #joining the space separated words with | for OR condition

        search_query = SearchQuery(query, search_type='raw')
        search_vector = SearchVector('nameCompany', weight='A') + SearchVector('description', weight='B') + SearchVector('address__city', weight='C')

        brands = Company.objects.annotate(
            search=search_vector,
            rank=SearchVector(search_vector, search_query)
        ).filter(search=search_query).order_by("-rank")

        return brands


class CompanyDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Company.objects.all()
    serializer_class = CompanyDetailsSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        print(user)

        if user.is_influencer == 0:
            queryset = Company.objects.filter(user_id=user.id)
        else:
            queryset = Company.objects.all()
        return queryset


class AddressCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

class AddressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

class OpeningCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Opening.objects.all()
    serializer_class = OpeningSerializer

class OpeningDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Opening.objects.all()
    serializer_class = OpeningSerializer

class OfferCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OfferCreateSerializer
        return OfferSerializer

    def get_queryset(self):
        company = self.request.query_params['company']
        queryset = Offer.objects.filter(company_id=company)
        return queryset

class OfferDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

class ReservationFilter(FilterSet):
    from_reservation = DateTimeFilter(field_name='dateReservation', lookup_expr='gte')
    to_reservation = DateTimeFilter(field_name='dateReservation', lookup_expr='lte')

    class Meta:
        model: Reservation
        fields = ['status', 'dateReservation', 'user'] #, 'from_reservation', 'to_reservation']

class ReservationCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reservation.objects.all()
    #serializer_class = ReservationSerializer
    pagination_class = None
    swagger_schema = None
    #filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    #filterset_fields = ['status', 'dateReservation', 'user',] # 'from_reservation', 'to_reservation']
    #filterset_class = ReservationFilter
    #ordering_fields = ('dateReservation')
    def get_serializer_class(self):
        if self.request.method == 'GET':
            if self.request.user.is_influencer:
                return InfluenceurReservationSerializer
            else:
                return BrandReservationSerializer
        return ReservationSerializer
    

    def create(self, request, *args, **kwargs):
        #request.data._mutable = True
        request.data['user'] = str(self.request.user.id)
        request.data['status'] = 0
        #request.data._mutable = False
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        queryset = Reservation.objects.all()
        user = self.request.user

        if user.is_influencer:
            status_resa = self.request.query_params.get('status')
            from_date_resa = self.request.query_params.get('from_date')
            to_date_resa = self.request.query_params.get('to_date')

            if status_resa:
                if from_date_resa:
                    queryset = Reservation.objects.filter(user=user.id, status=status_resa, dateReservation__gte=from_date_resa)
                elif to_date_resa:
                    queryset = Reservation.objects.filter(user=user.id, status=status_resa, dateReservation__lt=to_date_resa)
                else:
                    queryset = Reservation.objects.filter(user=user.id, status=status_resa)
        else:
            status_resa = self.request.query_params.get('status')
            from_date_resa = self.request.query_params.get('from_date')
            to_date_resa = self.request.query_params.get('to_date')

            if status_resa:
                if from_date_resa:
                    queryset = Reservation.objects.filter(offer__company__user_id=user.id, status=status_resa, dateReservation__gte=from_date_resa)
                elif to_date_resa:
                    queryset = Reservation.objects.filter(offer__company__user_id=user.id, status=status_resa, dateReservation__lt=to_date_resa)
                else:
                    queryset = Reservation.objects.filter(offer__company__user_id=user.id, status=status_resa)
        
        return queryset.order_by('dateReservation')


class ReservationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

class imgCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_class = (MultiPartParser, FormParser)
    serializer_class = imgCompanySerializer

    def post(self, request, *args, **kwargs):
      print("=== DANS POST METHOD")
      print(request.data)
      print(request)
      print(request.POST)
      file_serializer = imgCompanySerializer(data=request.data)
      if file_serializer.is_valid():
          file_serializer.save()
          return Response(file_serializer.data, status=status.HTTP_201_CREATED)
      else:
          print(file_serializer.errors)
          return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TypeCompanyView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = TypeCompany.objects.all()
    serializer_class = TypeCompanySerializer