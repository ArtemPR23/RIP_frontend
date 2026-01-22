import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .jwt_helper import *
from .jwt_helper import create_session
from .permissions import *
from .serializers import *
from .utils import identity_user


def get_draft_analysis_request(request):
    """Получить черновик запроса анализа для текущего пользователя"""
    
    user = identity_user(request)

    if user is None:
        return None
    
    return AnalysisRequest.objects.filter(status="DRAFT", owner=user).first()

  
# Набор методов для культурных артефактов
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'query',
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING
        )
    ]
)
@api_view(["GET"])
def search_artifacts(request):
    artifact_title = request.GET.get("title", "")

    artifacts = CulturalArtifact.objects.filter(is_active=True)

    if artifact_title:
        artifacts = artifacts.filter(title__icontains=artifact_title)

    serializer = CulturalArtifactSerializer(artifacts, many=True)

    draft_analysis_request = get_draft_analysis_request(request)

    resp = {
        "artifacts": serializer.data,
        "artifacts_count": AnalysisArtifact.objects.filter(analysis_request=draft_analysis_request).count() if draft_analysis_request else None,
        "draft_analysis_request": draft_analysis_request.pk if draft_analysis_request else None
    }

    return Response(resp)


@api_view(["GET"])
def get_artifact_by_id(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)
    serializer = CulturalArtifactSerializer(artifact, many=False)

    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsModerator])
def update_artifact(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)
    serializer = CulturalArtifactSerializer(artifact, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsModerator])
def create_artifact(request):
    artifacts = CulturalArtifact.objects.create()
 
    serializer = CulturalArtifactSerializer(artifacts)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsModerator])
def delete_artifact(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)
    artifact.is_active = False
    artifact.save()

    artifacts = CulturalArtifact.objects.filter(is_active=True)
    serializer = CulturalArtifactSerializer(artifacts, many=True)

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_artifact_to_analysis(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)

    draft_analysis_request = get_draft_analysis_request(request)

    if draft_analysis_request is None:
        draft_analysis_request = AnalysisRequest.objects.create(
            owner=identity_user(request),
            date_created=timezone.now(),
            status="DRAFT"
        )

    if AnalysisArtifact.objects.filter(analysis_request=draft_analysis_request, cultural_artifact=artifact).exists():
        return Response(
            {"error": "Артефакт уже добавлен в анализ"}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
        
    # Создаем объект со всеми необходимыми полями сразу
    item = AnalysisArtifact.objects.create(
        analysis_request=draft_analysis_request,
        cultural_artifact=artifact,
        weight=1.0,  # значение по умолчанию
        analysis_depth="BASIC"  # значение по умолчанию
    )
    item.save()
    try:
        calculate_api(item)
    except Exception as e:
        print(e)

    serializer = AnalysisRequestSerializer(draft_analysis_request)
    return Response(serializer.data["artifacts"])


import requests
import json

def calculate_api(item):
    # URL endpoint
    url = 'http://127.0.0.1:8080/api/calculate'
    url = 'http://host.docker.internal:8080/api/calculate'

    

    # Заголовки запроса
    headers = {
        'Authorization': 'secret12',
        'Content-Type': 'application/json'
    }

    # Получаем культурный артефакт, связанный с AnalysisArtifact
    cultural_artifact = item.cultural_artifact
    
    # Получаем draft_analysis_request (анализ, к которому привязан артефакт)
    draft_analysis_request = item.analysis_request
    
    # Данные для отправки в формате JSON
    # Используем данные из связанного CulturalArtifact
    data = {
        'base_influence_score': float(cultural_artifact.base_influence_score) if cultural_artifact.base_influence_score else 0,
        'citation_count': cultural_artifact.citation_count or 0,
        'media_mentions': cultural_artifact.media_mentions or 0,
        'social_media_score': float(cultural_artifact.social_media_score) if cultural_artifact.social_media_score else 0,
        'adaptation_count': cultural_artifact.adaptation_count or 0,
        'calculation_id': draft_analysis_request.id,  # ID запроса анализа
        'artifact_id': cultural_artifact.id  # ID запроса артефакта
    }
    print(data)

    try:
        # Отправка POST запроса
        response = requests.post(
            url=url,
            headers=headers,
            json=data  # автоматически конвертирует dict в JSON и устанавливает Content-Type
            # или можно использовать: data=json.dumps(data)
        )
        
        # Вывод информации о ответе
        print(f'Статус код: {response.status_code}')
        print(f'Заголовки ответа: {dict(response.headers)}')
        
        # Пытаемся вывести JSON ответ, если он есть
        try:
            print(f'JSON ответ: {response.json()}')
        except json.JSONDecodeError:
            print(f'Текст ответа: {response.text}')
            
    except requests.exceptions.RequestException as e:
        print(f'Ошибка при выполнении запроса: {e}')
    except Exception as e:
        print(f'Произошла ошибка: {e}')

@api_view(["POST"])
@permission_classes([IsModerator])
def update_artifact_image(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)

    image = request.FILES.get("image")  # Используем request.FILES для загруженных файлов
    if image is not None:
        # Сохраняем файл в поле image
        artifact.image = image
        artifact.save()

    serializer = CulturalArtifactSerializer(artifact)

    return Response(serializer.data)


# Набор методов для запросов анализа
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_analysis_requests(request):
    status_filter = request.GET.get("status", "")
    date_formation_start = request.GET.get("date_formation_start")
    date_formation_end = request.GET.get("date_formation_end")

    analysis_requests = AnalysisRequest.objects.exclude(status__in=["DELETED"])

    user = identity_user(request)

    if not user.is_staff:
        analysis_requests = analysis_requests.filter(owner=user)

    if status_filter:
        analysis_requests = analysis_requests.filter(status=status_filter)

    if date_formation_start and parse_datetime(date_formation_start):
        analysis_requests = analysis_requests.filter(date_created__gte=parse_datetime(date_formation_start))

    if date_formation_end and parse_datetime(date_formation_end):
        analysis_requests = analysis_requests.filter(date_created__lt=parse_datetime(date_formation_end))

    serializer = AnalysisRequestsSerializer(analysis_requests, many=True)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_analysis_request_by_id(request, analysis_request_id):
    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)
    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@swagger_auto_schema(method='put', request_body=AnalysisRequestSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_analysis_request(request, analysis_request_id):

    user = identity_user(request)


    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)
 
    serializer = AnalysisRequestSerializer(analysis_request, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_status_user(request, analysis_request_id):

    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    if analysis_request.status != "DRAFT":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

  
    analysis_request.status = "IN_PROGRESS"
    analysis_request.date_created = timezone.now()
    analysis_request.save()

    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsModerator])
def update_status_admin(request, analysis_request_id):
    if not AnalysisRequest.objects.filter(pk=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    request_status = request.data.get("status")

    if request_status not in ["COMPLETED", "CANCELLED"]:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    if analysis_request.status != "IN_PROGRESS":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # Расчет общего показателя влияния при завершении
    total_score = 0
    artifacts = analysis_request.artifacts.all()
    for artifact_item in artifacts:
        total_score += float(artifact_item.weighted_influence)
    
    analysis_request.completion_date = timezone.now()
    analysis_request.status = request_status
    analysis_request.moderator = identity_user(request)
    analysis_request.total_influence_score = total_score
    analysis_request.save()

    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_analysis_request(request, analysis_request_id):

    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    if analysis_request.status != "DRAFT":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    analysis_request.status = "DELETED"
    analysis_request.save()

    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


# Набор методов для м-м (артефакты анализа)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_artifact_from_analysis(request, analysis_request_id, artifact_id):

    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = AnalysisArtifact.objects.get(analysis_request=analysis_request_id, cultural_artifact_id=artifact_id)
    item.delete()

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    serializer = AnalysisRequestSerializer(analysis_request, many=False)
    artifacts = serializer.data["artifacts"]

    if len(artifacts) == 0:
        analysis_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(artifacts)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_artifact_analysis_request(request, analysis_request_id, artifact_id):
    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not AnalysisArtifact.objects.filter(artifact_id=artifact_id, analysis_request_id=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = AnalysisArtifact.objects.get(artifact_id=artifact_id, analysis_request_id=analysis_request_id)

    serializer = AnalysisArtifactSerializer(item)

    return Response(serializer.data)




@swagger_auto_schema(method='PUT', request_body=AnalysisArtifactSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_artifact_in_analysis(request, analysis_request_id, artifact_id):
    user = identity_user(request)

    if not AnalysisRequest.objects.filter(pk=analysis_request_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not AnalysisArtifact.objects.filter(cultural_artifact_id=artifact_id, analysis_request_id=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = AnalysisArtifact.objects.get(cultural_artifact_id=artifact_id, analysis_request_id=analysis_request_id)

    serializer = AnalysisArtifactSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

  

# Набор методов пользователей
@swagger_auto_schema(method='post', request_body=UserRegisterSerializer)
@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    user = serializer.save()

    session = create_session(user.id)
    cache.set(session, settings.SESSION_LIFETIME)

    serializer = UserSerializer(user)

    response = Response(serializer.data, status=status.HTTP_201_CREATED)
    response.set_cookie('session', session, httponly=True)

    return response



@swagger_auto_schema(method='post', request_body=UserLoginSerializer)
@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(**serializer.validated_data)
    if user is None:
        return Response(
            {"error": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Создаем JWT сессию
    session_token = create_session(user.id)
    
    # Сохраняем в кэш с правильными аргументами
    # session_token как ключ, user.id как значение, timeout в секундах
    cache.set(
        session_token, 
        user.id, 
        timeout=int(settings.SESSION_LIFETIME.total_seconds())
    )

    serializer = UserSerializer(user)

    response = Response(serializer.data, status=status.HTTP_200_OK)
    response.set_cookie(
        'session', 
        session_token, 
        max_age=int(settings.SESSION_LIFETIME.total_seconds()),
        httponly=True,
        samesite='Lax'
    )

    return response

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    session = get_session(request)

    cache.delete(session)

    return Response(status=status.HTTP_200_OK)


@swagger_auto_schema(method='PUT', request_body=UserSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = identity_user(request)

    if user.pk != user_id:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    serializer.save()

    return Response(serializer.data, status=status.HTTP_200_OK)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_current_user(request):
#     """Получить информацию о текущем аутентифицированном пользователе"""
#     user = identity_user(request)
#     if user:
#         return Response({
#             'id': user.id,
#             'username': user.username,
#             'email': user.email,
#             'is_staff': user.is_staff,
#             'is_active': user.is_active
#         })
#     return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)



@swagger_auto_schema(
    method='get',
    operation_description="Получить информацию о текущем аутентифицированном пользователе",
    responses={
        200: CurrentUserSerializer,
        401: 'Не авторизован'
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Получить информацию о текущем аутентифицированном пользователе"""
    user = identity_user(request)
    if user:
        serializer = CurrentUserSerializer(user)
        return Response(serializer.data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from .models import AnalysisArtifact, AnalysisRequest
from .serializers import UpdateArtifactScoreSerializer, AnalysisArtifactSerializer
import logging
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Настройка логгера
logger = logging.getLogger(__name__)

@swagger_auto_schema(
    method='put',
    operation_description="""
    Обновление расчетного показателя для артефакта анализа.
    
    Используется callback из Go-сервиса для обновления результатов расчета.
    Поддерживает как обновление конкретного артефакта, так и всех артефактов в анализе.
    """,
    request_body=UpdateArtifactScoreSerializer,
    responses={
        200: AnalysisArtifactSerializer,
        400: 'Ошибка валидации данных',
        404: 'Артефакт или запрос анализа не найден',
        500: 'Внутренняя ошибка сервера'
    }
)
@api_view(['PUT'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def update_artifact_score(request, calculation_id, artifact_id=None):
    """
    Обновление расчетного показателя для артефакта анализа.
    
    Используется callback из Go-сервиса.
    """
    try:
        logger.info(f"Получен callback для calculation_id: {calculation_id}, artifact_id: {artifact_id}")
        logger.info(f"Данные запроса: {request.data}")
        logger.info(f"Пользователь: {request.user}")
        
        # Валидация входных данных
        serializer = UpdateArtifactScoreSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Ошибка валидации данных: {serializer.errors}")
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем расчетный показатель из валидированных данных
        calculated_score = serializer.validated_data['calculated_score']
        weighted_influence = serializer.validated_data.get('weighted_influence')
        
        if artifact_id:
            # Обновляем конкретный артефакт
            artifact = get_object_or_404(
                AnalysisArtifact,
                cultural_artifact=artifact_id,
                analysis_request_id=calculation_id
            )
            
            # Обновляем поля
            artifact.calculated_score = calculated_score
            if weighted_influence is not None:
                # Если нужно, можно добавить поле для взвешенного влияния
                # artifact.weighted_score = weighted_influence
                pass
            
            artifact.save()
            
            logger.info(f"Обновлен артефакт {artifact_id}: calculated_score={calculated_score}")
            
            # Возвращаем обновленный объект
            response_serializer = AnalysisArtifactSerializer(artifact)
            return Response(response_serializer.data)
        
        else:
            # Обновляем все артефакты в запросе анализа
            analysis_request = get_object_or_404(
                AnalysisRequest,
                id=calculation_id
            )
            
            # Обновляем все артефакты в этом анализе
            artifacts_updated = 0
            for artifact in analysis_request.artifacts.all():
                artifact.calculated_score = calculated_score
                artifact.save()
                artifacts_updated += 1
            
            logger.info(f"Обновлено {artifacts_updated} артефактов для analysis_request {calculation_id}")
            
            return Response({
                "message": f"Updated {artifacts_updated} artifacts",
                "calculation_id": calculation_id,
                "calculated_score": calculated_score,
                "artifacts_updated": artifacts_updated
            })
            
    except AnalysisArtifact.DoesNotExist:
        logger.error(f"Артефакт не найден: calculation_id={calculation_id}, artifact_id={artifact_id}")
        return Response(
            {"error": "Artifact not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except AnalysisRequest.DoesNotExist:
        logger.error(f"Запрос анализа не найден: calculation_id={calculation_id}")
        return Response(
            {"error": "Analysis request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении артефакта: {str(e)}", exc_info=True)
        return Response(
            {"error": "Internal server error", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='put',
    operation_description="""
    Обновление общего показателя влияния для всего анализа.
    Вычисляется как сумма взвешенных влияний всех артефактов.
    
    Формула: total_score = Σ(artifact.calculated_score * artifact.weight)
    """
)
@api_view(['PUT', 'POST'])
def update_analysis_total_score(request, calculation_id):
    """
    Обновление общего показателя влияния для всего анализа.
    Вычисляется как сумма взвешенных влияний всех артефактов.
    """
    try:
        print(f"Обновление общего показателя для analysis_request: {calculation_id}")
        
        # Получаем запрос анализа
        analysis_request = get_object_or_404(
            AnalysisRequest,
            id=calculation_id
        )
        
        # Вычисляем общий показатель как сумма взвешенных влияний всех артефактов
        total_score = 0
        artifacts_count = 0
        
        for artifact in analysis_request.artifacts.all():
            if artifact.calculated_score:
                # Используем взвешенное влияние, если оно есть
                weighted_score = float(artifact.calculated_score) * float(artifact.weight)
                total_score += weighted_score
                artifacts_count += 1
        
        # Обновляем общий показатель в запросе анализа
        analysis_request.total_influence_score = total_score
        analysis_request.save()
        
        logger.info(f"Обновлен общий показатель для analysis_request {calculation_id}: {total_score}")
        
        return Response({
            "message": "Total influence score updated successfully",
            "calculation_id": calculation_id,
            "total_influence_score": total_score,
            "artifacts_count": artifacts_count
        })
        
    except AnalysisRequest.DoesNotExist:
        logger.error(f"Запрос анализа не найден: {calculation_id}")
        return Response(
            {"error": "Analysis request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Ошибка при обновлении общего показателя: {str(e)}", exc_info=True)
        return Response(
            {"error": "Internal server error", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='get',
    operation_description="""
    Получение текущего статуса артефакта.
    
    Используется Go-сервисом для проверки состояния расчета.
    Возвращает информацию о расчетном показателе, весе и статусе артефакта.
    """
)
@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_artifact_status(request, calculation_id, artifact_id):
    """
    Получение текущего статуса артефакта.
    Может использоваться для проверки Go-сервисом.
    """
    try:
        artifact = get_object_or_404(
            AnalysisArtifact,
            id=artifact_id,
            analysis_request_id=calculation_id
        )
        
        response_data = {
            "id": artifact.id,
            "calculation_id": calculation_id,
            "artifact_id": artifact_id,
            "cultural_artifact_id": artifact.cultural_artifact.id,
            "cultural_artifact_title": artifact.cultural_artifact.title,
            "calculated_score": artifact.calculated_score,
            "weight": float(artifact.weight),
            "status": "calculated" if artifact.calculated_score else "pending",
            "last_updated": artifact.updated_at.isoformat() if artifact.updated_at else None
        }
        
        return Response(response_data)
        
    except AnalysisArtifact.DoesNotExist:
        return Response(
            {"error": "Artifact not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@swagger_auto_schema(
    method='post',
    operation_description="""
    Пакетное обновление нескольких артефактов.
    
    Полезно, если Go-сервис обрабатывает несколько артефактов одновременно.
    Поддерживает частичное обновление - если некоторые артефакты не найдены,
    остальные все равно будут обновлены.
    """,
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'updates': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'calculation_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'artifact_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'calculated_score': openapi.Schema(type=openapi.TYPE_NUMBER)
                    }
                )
            )
        }
    )
)
@api_view(['POST'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def batch_update_artifacts(request):
    """
    Пакетное обновление нескольких артефактов.
    Полезно, если Go-сервис обрабатывает несколько артефактов одновременно.
    """
    try:
        updates = request.data.get('updates', [])
        
        if not isinstance(updates, list):
            return Response(
                {"error": "Updates should be a list"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        errors = []
        
        for update in updates:
            try:
                calculation_id = update.get('calculation_id')
                artifact_id = update.get('artifact_id')
                calculated_score = update.get('calculated_score')
                
                if not all([calculation_id, artifact_id, calculated_score]):
                    errors.append({
                        "update": update,
                        "error": "Missing required fields"
                    })
                    continue
                
                artifact = get_object_or_404(
                    AnalysisArtifact,
                    id=artifact_id,
                    analysis_request_id=calculation_id
                )
                
                artifact.calculated_score = calculated_score
                artifact.save()
                
                results.append({
                    "calculation_id": calculation_id,
                    "artifact_id": artifact_id,
                    "status": "updated",
                    "calculated_score": calculated_score
                })
                
                logger.info(f"Пакетное обновление: артефакт {artifact_id} обновлен")
                
            except AnalysisArtifact.DoesNotExist:
                errors.append({
                    "update": update,
                    "error": "Artifact not found"
                })
            except Exception as e:
                errors.append({
                    "update": update,
                    "error": str(e)
                })
        
        return Response({
            "results": results,
            "errors": errors,
            "total_updated": len(results),
            "total_errors": len(errors)
        })
        
    except Exception as e:
        logger.error(f"Ошибка при пакетном обновлении: {str(e)}", exc_info=True)
        return Response(
            {"error": "Internal server error", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )