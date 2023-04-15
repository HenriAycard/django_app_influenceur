from django.db import models
from django.core.files import File
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models
#from django.contrib.gis.db import models
#from django.contrib.gis.geos import Point
from backoffice.UserManager import UserManager
from django.contrib.auth.hashers import get_hasher, identify_hasher
import uuid
from django.contrib.auth.base_user import BaseUserManager
#from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import AbstractUser
import datetime
from django.contrib.auth.models import User
from django.shortcuts import reverse

def upload_to(instance, filename):
    return 'images/{filename}'.format(filename=filename)

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True,db_index=True)
    first_name = models.CharField(('first_name'), max_length=30, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(('last_name'), max_length=30, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    facebookId = models.CharField(max_length=100, null=True, blank=True,db_index=True)
    android = models.BooleanField(blank=True, default=False)
    ios = models.BooleanField(blank=True, default=False)
    acceptPush = models.BooleanField(default=False)
    pushToken = models.CharField(max_length=100, null=True, blank=True,db_index=True)
    is_active = models.BooleanField(('active'), default=True)
    is_staff = models.BooleanField(('staff'), default=False)
    is_influenceur = models.BooleanField(('influenceur'), default=False)
    valid = models.BooleanField(('valid'), default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = ('User')
        verbose_name_plural = ('Users')

    def get_full_name(self):
        '''
        Returns the first_name plus the last_name, with a space in between.
        '''
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        '''
        Returns the short name for the user.
        '''
        return self.first_name

class TypeCompany(models.Model):
    id = models.BigAutoField(primary_key=True)
    nameTypeCompany = models.CharField(('nameTypeCompany'), max_length=50, blank=True)

class Address(models.Model):
    id = models.BigAutoField(primary_key=True)
    address1 = models.CharField(('address1'), max_length=250, blank=True)
    address2 = models.CharField(('address2'), max_length=50, blank=True, null=True)
    address3 = models.CharField(('address3'), max_length=50, blank=True, null=True)
    city = models.CharField(('city'), max_length=30, blank=True)
    state = models.CharField(('state'), max_length=30, blank=True, null=True)
    country = models.CharField(('country'), max_length=30, blank=True)
    postalCode = models.CharField(('postalCode'),max_length=5, blank=True)

class Company(models.Model):
    id = models.BigAutoField(primary_key=True)
    isCompanyActif = models.BooleanField(('isCompanyActif'), default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    nameCompany = models.CharField(('nameCompany'), max_length=50, blank=True)
    isTakeAway = models.BooleanField(('isTakeAway'), default=False)
    isOnSit = models.BooleanField(('isOnSit'), default=False)
    description = models.CharField(('description'), max_length=800, blank=True)
    typeCompany = models.ForeignKey(TypeCompany, on_delete=models.CASCADE, null=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True)

class imgCompany(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='imgCompany')
    file = models.ImageField(upload_to=upload_to, blank=True, null=True)
    isPrincipal = models.BooleanField(('isPrincipal'), default=False)

class Opening(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='openings', null=True)
    fromDate = models.CharField(('fromDate'), max_length=15, blank=True)
    toDate = models.CharField(('toDate'), max_length=15, blank=True)
    startDate = models.CharField(('startDate'), max_length=15, blank=True)
    endDate = models.CharField(('endDate'), max_length=15, blank=True)
    pauseStart = models.CharField(('pauseStart'), max_length=15, blank=True)
    pauseEnd = models.CharField(('pauseEnd'), max_length=15, blank=True)
    isOpen = models.BooleanField(('isOpen'), default=False)
    isOrderBy = models.IntegerField(('isOrderBy'),blank=True)



class Offer(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True)
    nameOffer = models.CharField(('nameOffer'), max_length=100, blank=True)
    descriptionOffer = models.CharField(('descriptionOffer'), max_length=500, blank=True)
    descriptionCondition = models.CharField(('descriptionCondition'), max_length=500, blank=True)

class Reservation(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.IntegerField(('status'),blank=True)
    dateReservation = models.DateTimeField(('dateReservation'), null=True)
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE)



