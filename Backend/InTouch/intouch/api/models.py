from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
import uuid

# function
def upload_to(instance, filename):
    return 'images/{filename}'.format(filename=filename)

# Create your models here.
class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    """
    def _create_user(self, email, first_name, last_name, password, **extra_fields):
        """
        Create and save a User with the given email, first name, last name and password.
        """
        if not email:
            raise ValueError("User must have an email")
        if not password:
            raise ValueError("User must have a password")
        if not first_name:
            raise ValueError("User must have a first name")
        if not last_name:
            raise ValueError("User must have a last name")
        
        user = self.model(
            email=self.normalize_email(email)
        )
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password) # change password to hash

        user.is_active = False
        user.is_influencer = False
        user.is_company = False

        user.save(using=self._db)
        return user

    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', False)
        if extra_fields.get('is_superuser') is not False:
            raise ValueError('User must have is_superuser=False.')
        
        return self._create_user(email, first_name, last_name, password, **extra_fields)

    def create_superuser(self, email, first_name, last_name, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError(('Superuser must have is_staff=True.'))

        return self._create_user(email, first_name, last_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    first_name = models.CharField("person's first name", max_length=100, blank=True)
    last_name = models.CharField("person's last name", max_length=100, blank=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)

    facebook = models.CharField(max_length=100, null=True, blank=True)
    instagram = models.CharField(max_length=100, null=True, blank=True)
    tiktok = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    youtube = models.CharField(max_length=100, null=True, blank=True)
    snapchat = models.CharField(max_length=100, null=True, blank=True)

    is_active = models.BooleanField("user account is active", default=False)
    is_influencer = models.BooleanField("user account is an influencer", default=False)
    is_company = models.BooleanField("user account is a company", default=False)
    is_admin = models.BooleanField("user account is admin", default=False)

    avatar = models.ImageField(upload_to=upload_to, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

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
    
    @property
    def is_staff(self):
        return self.is_admin

class TypeCompany(models.Model):
    id = models.BigAutoField(primary_key=True)
    nameTypeCompany = models.CharField(max_length=100, blank=True)

class Address(models.Model):
    id = models.BigAutoField(primary_key=True)
    address1 = models.CharField(('address1'), max_length=250, blank=True)
    address2 = models.CharField(('address2'), max_length=50, blank=True, null=True)
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