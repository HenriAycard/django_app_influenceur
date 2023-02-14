# *coding: utf-8*
from api.serializers import *
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import generics, permissions, serializers
from rest_framework import filters
from backoffice.models import *
import json
import logging
from django.http import JsonResponse, HttpResponse
from django.db.models import Q, IntegerField, Value, Count, Sum, FloatField
import pandas as pd


# Get an instance of a logger
logger = logging.getLogger('django')


class UserListCreateView(generics.ListCreateAPIView):
    """
            get:
                Search or get users
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['password','last_login','is_superuser','id','email','first_name','last_name','date_joined','is_active','is_staff']
    swagger_schema = None
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
         # Filter for connected user
    def get_queryset(self):
            user = self.request.user
            queryset = User.objects.filter(pk=user.id)
            return queryset


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

class ActivityCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivitySerializer

    def get_queryset(self):
        user = self.request.user.id
        company = self.request.query_params['company']
        queryset = Activity.objects.filter(company__user_id=user, company_id=company)
        return queryset

class ActivitySearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer
    swagger_schema = None

    def get_queryset(self):
        search = self.request.query_params['search']
        df = pd.DataFrame()
        for val in search.split(" "):
            querysetNameActivity = Activity.objects.filter(nameActivity__icontains=val).annotate(weight=Value(0.8, output_field=FloatField()))
            querysetNameCompany = Activity.objects.filter(company__nameCompany__icontains=val).annotate(weight=Value(1, output_field=FloatField()))
            querysetDescription = Activity.objects.filter(description__icontains=val).annotate(weight=Value(0.6, output_field=FloatField()))
            query = querysetNameActivity.union(querysetDescription, querysetNameCompany, all=True).values('id', 'weight')
            tmp = pd.DataFrame(list(query))
            df = pd.concat([df, tmp])
        df_groupby = df.groupby(['id']).sum().sort_values(by=['weight'], ascending=False)
        pk_list = df_groupby.index.values.tolist()
        ordering = 'FIELD(`id`, %s)' % ','.join(str(id) for id in pk_list)
        queryset = Activity.objects.filter(pk__in=pk_list).extra(
           select={'ordering': ordering}, order_by=('ordering',))
        
        return queryset


class ActivityDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


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
        user = self.request.user.id
        activity = self.request.query_params['activity']
        queryset = Offer.objects.filter(activity__company__user_id=user, activity_id=activity)
        return queryset

class OfferDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer