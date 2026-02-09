from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class CulturalArtifact(models.Model):
    # Жанры для выбора
    GENRE_CHOICES = [
        ("POST_APOCALYPTIC", "Постапокалиптическая фантастика"),
        ("SCIENCE_FICTION", "Научная фантастика"),
        ("FANTASY", "Фэнтези"),
        ("CLASSIC", "Классика"),
        ("MODERN", "Современная литература"),
        ("HISTORICAL", "Исторический роман"),
        ("DETECTIVE", "Детектив"),
        ("ROMANCE", "Роман"),
        ("OTHER", "Другое"),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name="Название",
        help_text="Название культурного артефакта",
    )

    author = models.CharField(
        max_length=100, verbose_name="Автор", help_text="Автор или создатель артефакта"
    )

    description = models.TextField(
        verbose_name="Описание", help_text="Подробное описание культурного артефакта"
    )

    publication_year = models.CharField(
        max_length=4,
        verbose_name="Год публикации",
        help_text="Год первой публикации или создания",
    )

    genre = models.CharField(
        max_length=50,
        choices=GENRE_CHOICES,
        verbose_name="Жанр",
        help_text="Жанровая принадлежность",
    )

    base_influence_score = models.IntegerField(
        verbose_name="Базовый показатель влияния",
        validators=[MinValueValidator(0)],
        help_text="Базовый показатель культурного влияния",
    )

    citation_count = models.IntegerField(
        verbose_name="Количество цитирований",
        validators=[MinValueValidator(0)],
        help_text="Количество академических и научных цитирований",
    )

    media_mentions = models.IntegerField(
        verbose_name="Упоминания в СМИ",
        validators=[MinValueValidator(0)],
        help_text="Количество упоминаний в средствах массовой информации",
    )

    social_media_score = models.IntegerField(
        verbose_name="Показатель социальных сетей",
        validators=[MinValueValidator(0), MaxValueValidator(1000)],
        help_text="Популярность в социальных сетях (0-1000)",
    )

    adaptation_count = models.IntegerField(
        verbose_name="Количество адаптаций",
        validators=[MinValueValidator(0)],
        help_text="Количество экранизаций и адаптаций",
    )

    image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Изображение",
        help_text="URL-адрес изображения артефакта",
    )
    video = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Видео",
        help_text="URL-адрес видео артефакта",
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    is_active = models.BooleanField(
        default=True,
        verbose_name="Активный",
        help_text="Отображается ли артефакт в системе",
    )

    class Meta:
        verbose_name = "Культурный артефакт"
        verbose_name_plural = "Культурные артефакты"
        ordering = ["-base_influence_score", "title"]

    def __str__(self):
        return f"{self.title} - {self.author} ({self.publication_year})"

    def total_influence_score(self):
        """Расчет общего показателя влияния"""
        return (
            self.base_influence_score
            + self.citation_count * 2
            + self.media_mentions
            + self.social_media_score * 3
            + self.adaptation_count * 50
        )

    def get_genre_display_name(self):
        """Получить читаемое название жанра"""
        return dict(self.GENRE_CHOICES).get(self.genre, self.genre)

    def get_image(self):
        return self.image.url.replace("minio", "localhost", 1)

    @property
    def influence_category(self):
        """Категория влияния на основе общего показателя"""
        total_score = self.total_influence_score()
        if total_score > 1000:
            return "Высокое"
        elif total_score > 500:
            return "Среднее"
        else:
            return "Низкое"


from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class AnalysisRequest(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Черновик"),
        ("IN_PROGRESS", "В процессе"),
        ("COMPLETED", "Завершено"),
        ("CANCELLED", "Отменено"),
        ("DELETED", "Удален"),
    ]

    SCOPE_CHOICES = [
        ("GLOBAL", "глобальный"),
        ("REGIONAL", "региональный"),
        ("NATIONAL", "национальный"),
        ("LOCAL", "локальный"),
    ]

    METHODOLOGY_CHOICES = [
        ("CITATION_ANALYSIS", "комплексный анализ цитирований"),
        ("CONTENT_ANALYSIS", "контент-анализ"),
        ("DISCOURSE_ANALYSIS", "дискурс-анализ"),
        ("STATISTICAL_ANALYSIS", "статистический анализ"),
        ("COMPARATIVE_ANALYSIS", "сравнительный анализ"),
        ("MIXED_METHODS", "смешанные методы"),
    ]

    ANALYSIS_DEPTH_CHOICES = [
        ("BASIC", "базовая"),
        ("EXTENDED", "расширенный"),
        ("COMPREHENSIVE", "комплексный"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="DRAFT",
        verbose_name="Статус",
        help_text="Текущий статус анализа",
    )

    date_created = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    research_title = models.CharField(
        max_length=300,
        verbose_name="Название исследования",
        help_text="Название аналитического исследования",
    )

    researcher_name = models.CharField(
        max_length=100,
        verbose_name="Имя исследователя",
        help_text="ФИО исследователя или руководителя проекта",
    )

    research_scope = models.CharField(
        max_length=20,
        choices=SCOPE_CHOICES,
        verbose_name="Масштаб исследования",
        help_text="Географический или тематический масштаб исследования",
    )

    methodology = models.CharField(
        max_length=50,
        choices=METHODOLOGY_CHOICES,
        verbose_name="Методология",
        help_text="Используемая методология исследования",
    )

    total_influence_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Общий показатель влияния",
        help_text="Суммарный показатель влияния всех артефактов",
        default=1
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Описание исследования",
        help_text="Подробное описание целей и задач исследования",
    )

    completion_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Дата завершения",
        help_text="Дата завершения анализа",
    )
    owner = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь", null=True,
                              related_name='owner')
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Модератор", null=True,
                                  related_name='moderator')

    is_active = models.BooleanField(
        default=True, verbose_name="Активный", help_text="Активен ли запрос анализа"
    )

    class Meta:
        verbose_name = "Запрос анализа"
        verbose_name_plural = "Запросы анализа"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.research_title} - {self.researcher_name} ({self.get_status_display()})"

    def get_artifacts_count(self):
        """Количество артефактов в анализе"""
        return self.artifacts.count()

    def get_formatted_date(self):
        """Дата в формате '12 сентября 2024г'"""
        months = {
            1: "января",
            2: "февраля",
            3: "марта",
            4: "апреля",
            5: "мая",
            6: "июня",
            7: "июля",
            8: "августа",
            9: "сентября",
            10: "октября",
            11: "ноября",
            12: "декабря",
        }
        return f"{self.date_created.day} {months[self.date_created.month]} {self.date_created.year}г"

    @property
    def progress_percentage(self):
        """Процент завершения анализа"""
        if self.status == "COMPLETED":
            return 100
        elif self.status == "IN_PROGRESS":
            return 50
        else:
            return 0


class AnalysisArtifact(models.Model):
    analysis_request = models.ForeignKey(
        AnalysisRequest,
        on_delete=models.CASCADE,
        related_name="artifacts",
        verbose_name="Запрос анализа",
        help_text="Родительский запрос анализа",
    )

    cultural_artifact = models.ForeignKey(
        "CulturalArtifact",
        on_delete=models.CASCADE,
        verbose_name="Культурный артефакт",
        help_text="Связанный культурный артефакт",
    )

    weight = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        verbose_name="Вес",
        default=1,
        help_text="Вес артефакта в анализе (от 0 до 1)",
    )

    analysis_depth = models.CharField(
        max_length=20,
        choices=AnalysisRequest.ANALYSIS_DEPTH_CHOICES,
        verbose_name="Глубина анализа",
        help_text="Уровень детализации анализа для данного артефакта",
    )

    calculated_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Расчетный показатель",
        help_text="Расчетный показатель влияния с учетом веса",
    )

    class Meta:
        verbose_name = "м-м Артефакт анализа"
        verbose_name_plural = "м-м Артефакты анализа"
        unique_together = ["analysis_request", "cultural_artifact"]
        ordering = ["-weight"]

    def __str__(self):
        return (
            f"{self.cultural_artifact.title} в {self.analysis_request.research_title}"
        )

    def save(self, *args, **kwargs):
        """Автоматический расчет показателя при сохранении"""
        if self.cultural_artifact and not self.calculated_score:
            artifact_score = self.cultural_artifact.total_influence_score()
            self.calculated_score = artifact_score 
        super().save(*args, **kwargs)

    @property
    def weighted_influence(self):
        """Взвешенное влияние артефакта"""
        if self.calculated_score:
            return self.calculated_score
        artifact_score = self.cultural_artifact.total_influence_score()
        return artifact_score * self.weight

 