import jwt
from django.conf import settings
from django.utils import timezone

KEY = settings.JWT["SIGNING_KEY"]
ALGORITHM = settings.JWT["ALGORITHM"]
ACCESS_TOKEN_LIFETIME = settings.JWT["ACCESS_TOKEN_LIFETIME"]


def create_session(user_id):
    # Create initial payload
    payload = {
        "token_type": "access",
        "exp": timezone.now() + ACCESS_TOKEN_LIFETIME,
        "iat": timezone.now(),
    }
    # Add given arguments to payload
    payload["user_id"] = user_id
    # Create Token
    token = jwt.encode(payload, KEY, algorithm=ALGORITHM)
    return token




def get_session_payload(token):
    payload = jwt.decode(token, KEY, algorithms=[ALGORITHM])
    return payload


# def get_session(request):
#     cookie = request.headers.get("Cookie")

#     if "session" in cookie:
#         return request.COOKIES.get('session')

#     return cookie



def get_session(request):
    # Пробуем получить из кук
    session_cookie = request.COOKIES.get('session')
    if session_cookie:
        return session_cookie
    
    # Пробуем получить из заголовков Authorization
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split('Bearer ')[1]
    
    # Пробуем получить из заголовка X-Session-Token
    session_header = request.headers.get('X-Session-Token')
    if session_header:
        return session_header
        
    return None