from django.contrib import admin
from .models import User, Company, Address, TypeCompany, Opening, Offer, Reservation, imgCompany, FCMToken


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'firstname', 'lastname', 'is_influencer', 'is_company', 'is_active', 'created')
    list_filter = ('is_influencer', 'is_company', 'is_active')
    search_fields = ('email', 'firstname', 'lastname')
    ordering = ('-created',)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name_company', 'user', 'type_company', 'is_actif')
    list_filter = ('is_actif', 'type_company')
    search_fields = ('name_company', 'user__email')


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'start_date', 'end_date', 'quantity')
    list_filter = ('start_date',)
    search_fields = ('name', 'company__name_company')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'offer', 'status', 'date_reservation')
    list_filter = ('status',)
    search_fields = ('user__email', 'offer__name')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('address_principal', 'city', 'country', 'zip_code')
    search_fields = ('address_principal', 'city')


@admin.register(TypeCompany)
class TypeCompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(Opening)
class OpeningAdmin(admin.ModelAdmin):
    list_display = ('company', 'day', 'open_hour', 'close_hour', 'is_open')
    list_filter = ('is_open',)


@admin.register(imgCompany)
class ImgCompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'is_principal')
    list_filter = ('is_principal',)


@admin.register(FCMToken)
class FCMTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__email',)
