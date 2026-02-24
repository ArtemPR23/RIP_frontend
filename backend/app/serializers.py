from rest_framework import serializers
from .models import *

class CulturalArtifactSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    total_influence_score = serializers.SerializerMethodField()
    influence_category = serializers.SerializerMethodField()

    def get_image(self, artifact):
        if artifact.image:
            # Если image - это URL строка
            if isinstance(artifact.image, str):
                return artifact.image.replace("minio", "localhost", 1)
            # Если image - это FileField/ImageField объект
            elif hasattr(artifact.image, 'url'):
                return artifact.image.url.replace("minio", "localhost", 1)
        return "http://localhost:9000/images/default.png"

    def get_total_influence_score(self, artifact):
        return artifact.total_influence_score()

    def get_influence_category(self, artifact):
        return artifact.influence_category

    class Meta:
        model = CulturalArtifact
        fields = "__all__"


class CulturalArtifactItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    calculated_score = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()

    def get_image(self, artifact):
        if artifact.image:
            return artifact.image.replace("minio", "localhost", 1)
        return "http://localhost:9000/images/default.png"

    def get_calculated_score(self, artifact):
        return self.context.get("calculated_score")

    def get_weight(self, artifact):
        return self.context.get("weight")

    class Meta:
        model = CulturalArtifact
        fields = ("id", "title", "author", "image", "calculated_score", "weight")


class AnalysisRequestSerializer(serializers.ModelSerializer):
    artifacts = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    moderator = serializers.SerializerMethodField()
    artifacts_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    def get_owner(self, analysis_request):
        return analysis_request.owner.username if analysis_request.owner else None

    def get_moderator(self, analysis_request):
        return analysis_request.moderator.username if analysis_request.moderator else None

    def get_artifacts(self, analysis_request):
        items = AnalysisArtifact.objects.filter(analysis_request=analysis_request)
        return [CulturalArtifactItemSerializer(
            item.cultural_artifact, 
            context={
                "calculated_score": item.calculated_score,
                "weight": item.weight
            }
        ).data for item in items]

    def get_artifacts_count(self, analysis_request):
        return analysis_request.artifacts.count()

    def get_progress_percentage(self, analysis_request):
        return analysis_request.progress_percentage

    class Meta:
        model = AnalysisRequest
        fields = '__all__'


class AnalysisRequestsSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    moderator = serializers.SerializerMethodField()
    artifacts_count = serializers.SerializerMethodField()

    def get_owner(self, analysis_request):
        return analysis_request.owner.username if analysis_request.owner else None

    def get_moderator(self, analysis_request):
        return analysis_request.moderator.username if analysis_request.moderator else None

    def get_artifacts_count(self, analysis_request):
        return analysis_request.artifacts.count()

    class Meta:
        model = AnalysisRequest
        fields = "__all__"


class AnalysisArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisArtifact
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username')


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'username')
        write_only_fields = ('password',)
        read_only_fields = ('id',)

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)