import requests
from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import *


def get_draft_analysis_request():
    """Получить черновик запроса анализа для текущего пользователя"""
    return AnalysisRequest.objects.filter(status="DRAFT", owner=get_user()).first()


def get_user():
    """Получить текущего пользователя (в данной реализации - фиксированный)"""
    return User.objects.filter(is_superuser=False).first()


def get_moderator():
    """Получить модератора"""
    return User.objects.filter(is_superuser=True).first()


# Набор методов для культурных артефактов
@api_view(["GET"])
def search_artifacts(request):
    artifact_title = request.GET.get("title", "")

    artifacts = CulturalArtifact.objects.filter(is_active=True)

    if artifact_title:
        artifacts = artifacts.filter(title__icontains=artifact_title)

    serializer = CulturalArtifactSerializer(artifacts, many=True)

    draft_analysis_request = get_draft_analysis_request()

    resp = {
        "artifacts": serializer.data,
        "artifacts_count": len(serializer.data),
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
def update_artifact(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)
    serializer = CulturalArtifactSerializer(artifact, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(["POST"])
def create_artifact(request):
    # Получаем данные из запроса
    data = request.data
    
    # Создаем артефакт с полученными данными
    serializer = CulturalArtifactSerializer(data=data)
    
    if serializer.is_valid():
        serializer.save()
        
        # Возвращаем все активные артефакты
        artifacts = CulturalArtifact.objects.filter(is_active=True)
        serializer = CulturalArtifactSerializer(artifacts, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        # Возвращаем ошибки валидации
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
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
def add_artifact_to_analysis(request, artifact_id):
    if not CulturalArtifact.objects.filter(pk=artifact_id, is_active=True).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    artifact = CulturalArtifact.objects.get(pk=artifact_id)
    draft_analysis_request = get_draft_analysis_request()

    if draft_analysis_request is None:
        draft_analysis_request = AnalysisRequest.objects.create()
        draft_analysis_request.owner = get_user()
        draft_analysis_request.date_created = timezone.now()
        draft_analysis_request.save()

    if AnalysisArtifact.objects.filter(analysis_request=draft_analysis_request, cultural_artifact=artifact).exists():
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    # Создаем объект сразу со всеми необходимыми полями
    item = AnalysisArtifact.objects.create(
        analysis_request=draft_analysis_request,
        cultural_artifact=artifact
    )
    item.save()

    serializer = AnalysisRequestSerializer(draft_analysis_request)
    return Response(serializer.data["artifacts"])


@api_view(["POST"])
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
def search_analysis_requests(request):
    status_filter = request.GET.get("status", "")
    date_formation_start = request.GET.get("date_formation_start")
    date_formation_end = request.GET.get("date_formation_end")

    analysis_requests = AnalysisRequest.objects.exclude(status__in=["DRAFT", "DELETED"])

    if status_filter:
        analysis_requests = analysis_requests.filter(status=status_filter)

    if date_formation_start and parse_datetime(date_formation_start):
        analysis_requests = analysis_requests.filter(date_created__gte=parse_datetime(date_formation_start))

    if date_formation_end and parse_datetime(date_formation_end):
        analysis_requests = analysis_requests.filter(date_created__lt=parse_datetime(date_formation_end))

    serializer = AnalysisRequestsSerializer(analysis_requests, many=True)

    return Response(serializer.data)


@api_view(["GET"])
def get_analysis_request_by_id(request, analysis_request_id):
    if not AnalysisRequest.objects.filter(pk=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)
    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@api_view(["PUT"])
def update_analysis_request(request, analysis_request_id):
    if not AnalysisRequest.objects.filter(pk=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)
    
    # Запрещаем изменение системных полей
    restricted_fields = ['status', 'date_created', 'completion_date', 'owner', 'moderator']
    for field in restricted_fields:
        if field in request.data:
            del request.data[field]
    
    serializer = AnalysisRequestSerializer(analysis_request, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(["PUT"])
def update_status_user(request, analysis_request_id):
    if not AnalysisRequest.objects.filter(pk=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    if analysis_request.status != "DRAFT":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # Проверка обязательных полей перед формированием
    required_fields = ['research_title', 'researcher_name', 'research_scope', 'methodology']
    for field in required_fields:
        if not getattr(analysis_request, field):
            return Response(
                {"error": f"Поле {field} обязательно для формирования запроса"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    analysis_request.status = "IN_PROGRESS"
    analysis_request.date_created = timezone.now()
    analysis_request.save()

    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@api_view(["PUT"])
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
    analysis_request.moderator = get_moderator()
    analysis_request.total_influence_score = total_score
    analysis_request.save()

    serializer = AnalysisRequestSerializer(analysis_request, many=False)

    return Response(serializer.data)


@api_view(["DELETE"])
def delete_analysis_request(request, analysis_request_id):
    if not AnalysisRequest.objects.filter(pk=analysis_request_id).exists():
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
def delete_artifact_from_analysis(request, analysis_request_id, artifact_id):
    if not AnalysisArtifact.objects.filter(analysis_request_id=analysis_request_id, cultural_artifact_id=artifact_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = AnalysisArtifact.objects.get(analysis_request_id=analysis_request_id, cultural_artifact_id=artifact_id)
    item.delete()

    analysis_request = AnalysisRequest.objects.get(pk=analysis_request_id)

    serializer = AnalysisRequestSerializer(analysis_request, many=False)
    artifacts = serializer.data["artifacts"]

    if len(artifacts) == 0:
        analysis_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(artifacts)


@api_view(["PUT"])
def update_artifact_in_analysis(request, analysis_request_id, artifact_id):
    if not AnalysisArtifact.objects.filter(cultural_artifact_id=artifact_id, analysis_request_id=analysis_request_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = AnalysisArtifact.objects.get(cultural_artifact_id=artifact_id, analysis_request_id=analysis_request_id)

    serializer = AnalysisArtifactSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


# Набор методов пользователей
@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    user = serializer.save()

    serializer = UserSerializer(user)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(**serializer.data)
    if user is None:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    serializer = UserSerializer(user)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def logout(request):
    return Response(status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = User.objects.get(pk=user_id)
    serializer = UserSerializer(user, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    serializer.save()

    return Response(serializer.data)


from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_cart_icon(request):
    """Возвращает URL иконки корзины"""
    return Response({
        "image": "http://localhost:9000/images/cart-icon.png"
    })