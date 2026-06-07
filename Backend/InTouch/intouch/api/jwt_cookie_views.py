"""JWT views that keep the refresh token in an httpOnly cookie.

The access token stays in the JSON body (the SPA holds it in memory and sends it
as a `Bearer` header). The long-lived refresh token is never exposed to
JavaScript: it is set as an httpOnly, SameSite cookie scoped to the auth
endpoints, so an XSS payload cannot read or exfiltrate it.

Server-side invalidation: `rest_framework_simplejwt.token_blacklist` is installed.
Logout blacklists the refresh token; `ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION`
automatically blacklists rotated tokens on every refresh.
"""
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def _cookie_max_age() -> int:
    return int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())


def _set_refresh_cookie(response: Response, refresh: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh,
        max_age=_cookie_max_age(),
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        path=settings.REFRESH_COOKIE_PATH,
    )


def _delete_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
    )


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login. Sets the refresh token as an httpOnly cookie.

    The refresh token is intentionally LEFT in the JSON body as well: the InTouch
    SSO portal mints tokens through this endpoint server-side and reads `refresh`
    from the body to build its `/sso#access=...&refresh=...` redirect. The browser
    SPA ignores the body `refresh` (it never persists it) and relies on the
    cookie, so leaving it in the body does not reintroduce localStorage exposure.
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK and "refresh" in response.data:
            _set_refresh_cookie(response, response.data["refresh"])
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Refresh using the httpOnly cookie instead of a request-body field.

    Returns a new access token. When `ROTATE_REFRESH_TOKENS` is on, the rotated
    refresh token is written back to the cookie. An invalid/expired cookie yields
    401 and clears the cookie so the client falls back to a fresh login.
    """

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not refresh:
            return Response(
                {"detail": "Refresh cookie not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError):
            response = Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _delete_refresh_cookie(response)
            return response

        data = serializer.validated_data
        response = Response({"access": data["access"]}, status=status.HTTP_200_OK)
        if "refresh" in data:
            _set_refresh_cookie(response, data["refresh"])
        return response


class RefreshCookieFromTokenView(APIView):
    """SSO bridge.

    The InTouch portal redirects to the SPA with a refresh token in the URL
    fragment. The SPA posts it here once; we validate it, store it in the
    httpOnly cookie, and return a fresh access token — so the refresh token stops
    living in JavaScript-reachable storage from then on.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        raw = request.data.get("refresh")
        if not raw:
            return Response(
                {"detail": "Missing refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(raw)
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            {"access": str(token.access_token)}, status=status.HTTP_200_OK
        )
        _set_refresh_cookie(response, raw)
        return response


class CookieLogoutView(APIView):
    """Logout. Blacklists the refresh token and clears the cookie."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass  # already expired/invalid — clearing the cookie is sufficient
        response = Response(status=status.HTTP_205_RESET_CONTENT)
        _delete_refresh_cookie(response)
        return response
