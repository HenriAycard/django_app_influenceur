from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCompanyOwner(BasePermission):
    """Allow write access only to the company's owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user


class IsRelatedToCompanyOwner(BasePermission):
    """Allow write access only when request.user owns the related company."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.company.user == request.user


class IsReservationParty(BasePermission):
    """Allow write access to the influencer who made the reservation or the company owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return obj.user == user or obj.offer.company.user == user
