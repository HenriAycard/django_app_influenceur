from django.contrib import admin
from .models import User, Venue, Address, TypeVenue, Opening, Offer, Reservation, imgVenue, FCMToken
from .emails import send_account_approved


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'firstname', 'lastname', 'role', 'socials', 'is_active', 'created')
    list_filter = ('is_active', 'is_influencer', 'is_company')
    search_fields = ('email', 'firstname', 'lastname', 'instagram', 'tiktok', 'youtube')
    ordering = ('is_active', '-created')  # pending applications first
    actions = ('approve_and_invite',)

    @admin.display(description='Role')
    def role(self, obj):
        if obj.is_influencer:
            return 'Influencer'
        if obj.is_company:
            return 'Venue'
        return '—'

    @admin.display(description='Socials')
    def socials(self, obj):
        handles = [h for h in (obj.instagram, obj.tiktok, obj.youtube) if h]
        return ', '.join(handles) or '—'

    @admin.action(description='Approve and send set-password invitation')
    def approve_and_invite(self, request, queryset):
        # Activating before the password exists is safe: an unusable password
        # cannot authenticate. The emailed link lets the user set one.
        # Re-running the action on an approved-but-passwordless account
        # re-sends the invitation (covers a lost email — djoser's forgot
        # password ignores accounts without a usable password).
        sent = skipped = 0
        for user in queryset:
            if user.is_active and user.has_usable_password():
                skipped += 1
                continue
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=['is_active'])
            send_account_approved(user)
            sent += 1
        message = f"{sent} invitation(s) sent."
        if skipped:
            message += f" {skipped} account(s) already set up were skipped."
        self.message_user(request, message)


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name_venue', 'user', 'type_venue', 'is_actif')
    list_filter = ('is_actif', 'type_venue')
    search_fields = ('name_venue', 'user__email')


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('name', 'venue', 'start_date', 'end_date', 'quantity')
    list_filter = ('start_date',)
    search_fields = ('name', 'venue__name_venue')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'offer', 'status', 'date_reservation')
    list_filter = ('status',)
    search_fields = ('user__email', 'offer__name')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('address_principal', 'city', 'country', 'zip_code')
    search_fields = ('address_principal', 'city')


@admin.register(TypeVenue)
class TypeVenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(Opening)
class OpeningAdmin(admin.ModelAdmin):
    list_display = ('venue', 'day', 'open_hour', 'close_hour', 'is_open')
    list_filter = ('is_open',)


@admin.register(imgVenue)
class ImgVenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'venue', 'is_principal')
    list_filter = ('is_principal',)


@admin.register(FCMToken)
class FCMTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__email',)
