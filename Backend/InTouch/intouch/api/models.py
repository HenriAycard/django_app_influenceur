from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from datetime import datetime, date
import os
import uuid

# function
def upload_to(instance, filename):
    now = datetime.now()
    base, ext = os.path.splitext(filename)
    return f'images/{now.year}/{now.month}/{now.day}/{base}{ext}'

# Create your models here.
class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    """
    def _create_user(self, email, firstname, lastname, password, **extra_fields):
        """
        Create and save a User with the given email, first name, last name and password.
        """
        if not email:
            raise ValueError("User must have an email")
        if not password:
            raise ValueError("User must have a password")
        if not firstname:
            raise ValueError("User must have a first name")
        if not lastname:
            raise ValueError("User must have a last name")
        
        user = self.model(
            email=self.normalize_email(email)
        )
        user.firstname = firstname
        user.lastname = lastname
        user.set_password(password) # change password to hash

        user.is_active = False
        user.is_influencer = False
        user.is_company = False

        user.save(using=self._db)
        return user

    def create_user(self, email, firstname, lastname, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', False)
        if extra_fields.get('is_superuser') is not False:
            raise ValueError('User must have is_superuser=False.')
        
        return self._create_user(email, firstname, lastname, password, **extra_fields)

    def create_superuser(self, email, firstname, lastname, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('is_staff') is not True:
            raise ValueError(('Superuser must have is_staff=True.'))

        return self._create_user(email, firstname, lastname, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    firstname = models.CharField(max_length=100, blank=True)
    lastname = models.CharField(max_length=100, blank=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)

    facebook = models.CharField(max_length=100, null=True, blank=True)
    instagram = models.CharField(max_length=100, null=True, blank=True)
    tiktok = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    youtube = models.CharField(max_length=100, null=True, blank=True)
    snapchat = models.CharField(max_length=100, null=True, blank=True)
    # self-declared follower counts per network (chantier #4)
    instagram_followers = models.PositiveIntegerField(null=True, blank=True)
    tiktok_followers = models.PositiveIntegerField(null=True, blank=True)
    youtube_followers = models.PositiveIntegerField(null=True, blank=True)

    is_active = models.BooleanField("user account is active", default=False)
    is_influencer = models.BooleanField("user account is an influencer", default=False)
    is_company = models.BooleanField("user account is a company", default=False)
    is_admin = models.BooleanField("user account is admin", default=False)
    # Opt-out switch for notification emails (account emails are always sent).
    email_notifications = models.BooleanField(default=True)

    avatar = models.ImageField(upload_to=upload_to, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname']

    objects = UserManager()

    class Meta:
        verbose_name = ('User')
        verbose_name_plural = ('Users')

    def get_full_name(self):
        '''
        Returns the firstname plus the last_name, with a space in between.
        '''
        full_name = '%s %s' % (self.firstname, self.lastname)
        return full_name.strip()

    def get_short_name(self):
        '''
        Returns the short name for the user.
        '''
        return self.firstname
    
    @property
    def is_staff(self):
        return self.is_admin

class TypeVenue(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True)

class Address(models.Model):
    id = models.BigAutoField(primary_key=True)
    address_principal = models.CharField(max_length=250, blank=True)
    address_secondary = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=30, blank=True)
    state = models.CharField(max_length=30, blank=True, null=True)
    country = models.CharField(max_length=30, blank=True)
    zip_code = models.CharField(max_length=5, blank=True)

class Venue(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name_venue = models.CharField(max_length=50, blank=True)
    is_takeaway = models.BooleanField(default=False)
    is_onsit = models.BooleanField(default=False)
    description = models.CharField(max_length=800, blank=True)
    facebook = models.CharField(max_length=100, null=True, blank=True)
    instagram = models.CharField(max_length=100, null=True, blank=True)
    tiktok = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    youtube = models.CharField(max_length=100, null=True, blank=True)
    type_venue = models.ForeignKey(TypeVenue, on_delete=models.CASCADE, null=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True)
    is_actif = models.BooleanField(default=True)

class imgVenue(models.Model):
    id = models.BigAutoField(primary_key=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='imgVenue')
    file = models.ImageField(upload_to=upload_to, blank=True, null=True)
    is_principal = models.BooleanField(default=False)

class Opening(models.Model):
    id = models.BigAutoField(primary_key=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='openings', null=True)
    id_day = models.IntegerField(blank=True)
    day = models.CharField(max_length=15, blank=True)
    open_hour = models.CharField(max_length=15, blank=True)
    close_hour = models.CharField(max_length=15, blank=True)
    break_start = models.CharField(max_length=15, blank=True)
    break_end = models.CharField(max_length=15, blank=True)
    is_open = models.BooleanField(default=False)
    

class Offer(models.Model):
    id = models.BigAutoField(primary_key=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField(default=date.today)
    end_date = models.DateField(null=True, blank=True)
    content = models.TextField(max_length=1000)
    conditions = models.TextField(max_length=1000)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    tags = models.CharField(max_length=100)
    publishing_deadline = models.PositiveIntegerField(null=True, blank=True)
    contact_approver = models.CharField(max_length=100, null=True, blank=True)
    payment_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    payment_terms = models.TextField(null=True, blank=True)
    cancellation_policy = models.TextField(max_length=1000, null=True, blank=True)
    special_instructions = models.TextField(max_length=1000, null=True, blank=True)
    exclusivity_duration = models.PositiveIntegerField(null=True, blank=True)
    restricted_competitors = models.CharField(max_length=200, null=True, blank=True)
    scope_exclusivity = models.TextField(max_length=500, null=True, blank=True)
    exclusivity_type = models.CharField(max_length=50, null=True, blank=True)
    exclusivity_specification = models.TextField(max_length=500, null=True, blank=True)
    # chantier #4 — extra offer fields
    guests = models.PositiveIntegerField(null=True, blank=True)
    # optional minimum follower requirement, per network
    min_followers_instagram = models.PositiveIntegerField(null=True, blank=True)
    min_followers_tiktok = models.PositiveIntegerField(null=True, blank=True)
    min_followers_youtube = models.PositiveIntegerField(null=True, blank=True)

class Reservation(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.IntegerField(blank=True)
    date_reservation = models.DateTimeField(null=True)
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE)
    # When the day-before email reminder went out (idempotence for the cron).
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            # One ACTIVE application (pending or accepted) per influencer and
            # offer. Declined/cancelled ones don't count: re-applying later
            # is a legitimate flow.
            models.UniqueConstraint(
                fields=['user', 'offer'],
                condition=models.Q(status__in=(0, 1)),
                name='unique_active_application',
            ),
        ]

class Review(models.Model):
    """A rating left after a completed collaboration (an ACCEPTED reservation
    whose date has passed). Direction is inferred from the author:
    - author == reservation.user        -> the influencer rating the venue
    - author == reservation.offer.venue.user -> the brand rating the influencer
    One review per party per collaboration (unique reservation+author)."""
    id = models.BigAutoField(primary_key=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(max_length=1000, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['reservation', 'author'], name='unique_review_per_party'),
        ]

class FCMToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class VenueView(models.Model):
    """A single visit of a venue page by an influencer (for venue analytics).

    `user` is kept nullable so a view survives the visitor's account deletion;
    the venue owner's own visits are not recorded (see VenueViewLogView)."""
    id = models.BigAutoField(primary_key=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Conversation(models.Model):
    """A thread between an influencer and a venue. Scoped to the venue (not the
    brand user) so a company managing several venues gets one thread per venue,
    labelled by the venue rather than the person who manages it."""
    id = models.BigAutoField(primary_key=True)
    influencer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)  # bumped on each new message, for sorting

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['influencer', 'venue'], name='unique_influencer_venue_conversation'),
        ]


class Message(models.Model):
    id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    # When this message was included in an unread-digest email (cron idempotence).
    unread_emailed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']