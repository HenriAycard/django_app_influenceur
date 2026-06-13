from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsVenueOwner(BasePermission):
    """Allow write access only to the venue's owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user


class IsRelatedToVenueOwner(BasePermission):
    """Allow write access only when request.user owns the related venue."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.venue.user == request.user


class IsReservationParty(BasePermission):
    """Allow access only to the influencer who made the reservation or the venue owner."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        return obj.user == user or obj.offer.venue.user == user
