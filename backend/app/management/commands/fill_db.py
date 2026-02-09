import random
from django.core.management.base import BaseCommand
from minio import Minio
from django.utils import timezone
from datetime import timedelta

from ...models import *


def random_date(start_year=2020, end_year=2024):
    """Генерация случайной даты"""
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return timezone.datetime(year, month, day).date()


def random_timedelta(max_days=30):
    """Генерация случайного временного интервала"""
    return timedelta(days=random.randint(1, max_days))


def add_users():
    """Добавление пользователей"""
    User.objects.create_user("user", "user@user.com", "1234", first_name="user", last_name="user")
    User.objects.create_superuser("root", "root@root.com", "1234", first_name="root", last_name="root")

    for i in range(1, 10):
        User.objects.create_user(f"user{i}", f"user{i}@user.com", "1234", first_name=f"user{i}", last_name=f"user{i}")
        User.objects.create_superuser(f"root{i}", f"root{i}@root.com", "1234", first_name=f"user{i}", last_name=f"user{i}")

    print("Пользователи созданы")


def add_cultural_artifacts():
    """Добавление культурных артефактов"""
    
    cultural_artifacts = [
        {
            "title": "Метро 2033",
            "author": "Дмитрий Глуховский",
            "description": "Постапокалиптический роман, породивший медиафраншизу и оказавший значительное влияние на современную русскую фантастику",
            "publication_year": "2005",
            "genre": "POST_APOCALYPTIC",
            "base_influence_score": 410,
            "citation_count": 150,
            "media_mentions": 95,
            "social_media_score": 85,
            "adaptation_count": 3,
            "image": "http://localhost:9000/images/metro2033.png",
            "video": "http://localhost:9000/images/metro2033.mp4",
        },
        {
            "title": "Игра престолов", 
            "author": "Джордж Р.Р. Мартин",
            "description": "Эпический фэнтези-сериал, ставший глобальным культурным феноменом и изменивший телевизионную индустрию",
            "publication_year": "2011",
            "genre": "FANTASY",
            "base_influence_score": 920,
            "citation_count": 320,
            "media_mentions": 450,
            "social_media_score": 380,
            "adaptation_count": 1,
            "image": "http://localhost:9000/images/got.png",
            "video": "http://localhost:9000/images/got.mp4",
        },
        {
            "title": "Оно",
            "author": "Стивен Кинг",
            "description": "Культовый роман ужасов, образ Пеннивайза стал одним из самых узнаваемых в поп-культуре",
            "publication_year": "1986",
            "genre": "OTHER",
            "base_influence_score": 900,
            "citation_count": 280,
            "media_mentions": 320,
            "social_media_score": 410,
            "adaptation_count": 2,
            "image": "http://localhost:9000/images/it.png",
            "video": "http://localhost:9000/images/it.mp4",
        },
        {
            "title": "MrBeast",
            "author": "Джимми Дональдсон", 
            "description": "YouTube-создатель, изменивший подход к созданию контента и филантропии в цифровой среде",
            "publication_year": "2012",
            "genre": "OTHER",
            "base_influence_score": 950,
            "citation_count": 45,
            "media_mentions": 280,
            "social_media_score": 890,
            "adaptation_count": 0,
            "image": "http://localhost:9000/images/mrbeast.png",
            "video": "http://localhost:9000/images/mrbeast.mp4",
        },
        {
            "title": "Comedy Club",
            "author": "Гарик Мартиросян, Артур Джанибекян",
            "description": "Юмористическое шоу, сформировавшее язык и юмор целого поколения в России",
            "publication_year": "2005", 
            "genre": "OTHER",
            "base_influence_score": 780,
            "citation_count": 120,
            "media_mentions": 310,
            "social_media_score": 290,
            "adaptation_count": 15,
            "image": "http://localhost:9000/images/comedyclub.png",
            "video": "http://localhost:9000/images/comedyclub.mp4",
        },
        {
            "title": "Офис (The Office)",
            "author": "Грег Дэниелс",
            "description": "Ситком, определивший формат мокьюментари и ставший источником бесчисленных мемов",
            "publication_year": "2005",
            "genre": "OTHER",
            "base_influence_score": 890,
            "citation_count": 210,
            "media_mentions": 190,
            "social_media_score": 670,
            "adaptation_count": 8,
            "image": "http://localhost:9000/images/office.png",
            "video": "http://localhost:9000/images/office.mp4",
        }
    ]

    for artifact_data in cultural_artifacts:
        CulturalArtifact.objects.create(**artifact_data)

    # Загрузка изображений в MinIO (если нужно)
    try:
        client = Minio("minio:9000", "minio", "minio123", secure=False)
        # Загружаем изображения для ваших артефактов
        image_files = [
            "metro2033", "got", "it", 
            "mrbeast", "comedyclub", "office"
        ]
        
        for image_file in image_files:
            try:
                client.fput_object('images', f'{image_file}.png', f"app/static/images/{image_file}.png")
                client.fput_object('images', f'{image_file}.mp4', f"app/static/video/{image_file}.mp4")
                print(f"Изображение {image_file} загружено в MinIO")
            except Exception as e:
                print(f"Ошибка при загрузке {image_file}: {e}")
        
        client.fput_object('images', 'default.png', "app/static/images/default.png")
    except Exception as e:
        print(f"Ошибка при подключении к MinIO: {e}")

    print("Культурные артефакты добавлены")


def add_analysis_requests():
    """Добавление запросов анализа"""
    users = User.objects.filter(is_staff=False)
    moderators = User.objects.filter(is_staff=True)

    if len(users) == 0 or len(moderators) == 0:
        print("Запросы анализа не могут быть добавлены. Сначала добавьте пользователей с помощью команды add_users")
        return

    artifacts = CulturalArtifact.objects.filter(is_active=True)

    # Создаем основной запрос анализа как в примере
    add_main_analysis_request(users[0], moderators[0], artifacts)
    
    # Создаем дополнительные запросы в разных статусах
    statuses = ["IN_PROGRESS", "COMPLETED", "CANCELLED"]
    
    for _ in range(10):
        status = random.choice(statuses)
        owner = random.choice(users)
        add_random_analysis_request(status, artifacts, owner, moderators)

    print("Запросы анализа добавлены")


def add_main_analysis_request(owner, moderator, artifacts):
    """Создание основного запроса анализа как в примере"""
    
    # Создаем запрос анализа
    analysis_request = AnalysisRequest.objects.create(
        research_title="Анализ влияния современных медиафеноменов",
        researcher_name="Иванов И.И.",
        research_scope="GLOBAL",
        methodology="CITATION_ANALYSIS",
        description="Исследование культурного влияния ключевых медиафеноменов современности",
        total_influence_score=3850,
        owner=owner,
        status="DRAFT"
    )

    # Добавляем артефакты с указанными весами
    artifact_weights = [
        {"artifact_id": 1, "weight": 0.3, "analysis_depth": "EXTENDED"},
        {"artifact_id": 2, "weight": 0.4, "analysis_depth": "BASIC"},
        {"artifact_id": 3, "weight": 0.3, "analysis_depth": "EXTENDED"}
    ]
    
    for artifact_weight in artifact_weights:
        try:
            artifact = CulturalArtifact.objects.get(id=artifact_weight["artifact_id"])
            AnalysisArtifact.objects.create(
                analysis_request=analysis_request,
                cultural_artifact=artifact,
                weight=artifact_weight["weight"],
                analysis_depth=artifact_weight["analysis_depth"]
            )
        except CulturalArtifact.DoesNotExist:
            print(f"Артефакт с id {artifact_weight['artifact_id']} не найден")

    analysis_request.save()
    print("Основной запрос анализа создан")


def add_random_analysis_request(status, artifacts, owner, moderators):
    """Создание случайного запроса анализа"""
    
    research_titles = [
        "Анализ культурного влияния современных медиа",
        "Исследование феноменов поп-культуры XXI века", 
        "Сравнительный анализ российских и зарубежных медиапродуктов",
        "Изучение адаптаций литературных произведений в кино",
        "Анализ популярности контента в социальных сетях",
        "Исследование культурного наследия современных шоу"
    ]
    
    methodologies = [
        "CITATION_ANALYSIS",
        "CONTENT_ANALYSIS", 
        "DISCOURSE_ANALYSIS",
        "STATISTICAL_ANALYSIS",
        "COMPARATIVE_ANALYSIS",
        "MIXED_METHODS"
    ]
    
    scopes = ["GLOBAL", "REGIONAL", "NATIONAL", "LOCAL"]
    analysis_depths = ["BASIC", "EXTENDED", "COMPREHENSIVE"]

    analysis_request = AnalysisRequest.objects.create(
        research_title=random.choice(research_titles),
        researcher_name=f"{owner.first_name} {owner.last_name}",
        research_scope=random.choice(scopes),
        methodology=random.choice(methodologies),
        description=f"Автоматически сгенерированное исследование пользователя {owner.username}",
        owner=owner,
        status=status
    )

    # Устанавливаем даты в зависимости от статуса
    if status in ["COMPLETED", "CANCELLED"]:
        analysis_request.completion_date = random_date()
        analysis_request.date_created = analysis_request.completion_date - random_timedelta(60)
        analysis_request.moderator = random.choice(moderators)
        
        # Расчет общего показателя влияния для завершенных запросов
        total_score = 0
        selected_artifacts = random.sample(list(artifacts), random.randint(2, 4))
        
        for artifact in selected_artifacts:
            weight = round(random.uniform(0.1, 1.0), 2)
            analysis_depth = random.choice(analysis_depths)
            
            item = AnalysisArtifact(
                analysis_request=analysis_request,
                cultural_artifact=artifact,
                weight=weight,
                analysis_depth=analysis_depth
            )
            item.save()
            total_score += float(item.weighted_influence)
        
        analysis_request.total_influence_score = total_score
        
    elif status == "IN_PROGRESS":
        analysis_request.date_created = random_date(2023, 2024)
        # Добавляем артефакты без расчета итогового score
        selected_artifacts = random.sample(list(artifacts), random.randint(1, 3))
        for artifact in selected_artifacts:
            weight = round(random.uniform(0.1, 1.0), 2)
            analysis_depth = random.choice(analysis_depths)
            
            AnalysisArtifact.objects.create(
                analysis_request=analysis_request,
                cultural_artifact=artifact,
                weight=weight,
                analysis_depth=analysis_depth
            )
    else:  # DRAFT
        analysis_request.date_created = random_date(2024, 2024)
        # Для черновика можно добавить артефакты
        selected_artifacts = random.sample(list(artifacts), random.randint(1, 2))
        for artifact in selected_artifacts:
            AnalysisArtifact.objects.create(
                analysis_request=analysis_request,
                cultural_artifact=artifact,
                weight=1.0,
                analysis_depth="BASIC"
            )

    analysis_request.save()


class Command(BaseCommand):
    help = 'Заполнение базы данных тестовыми данными'

    def handle(self, *args, **kwargs):
        self.stdout.write('Начало заполнения базы данных...')
        
        add_users()
        add_cultural_artifacts() 
        add_analysis_requests()
        
        self.stdout.write(
            self.style.SUCCESS('База данных успешно заполнена тестовыми данными!')
        )
        
        # Выводим статистику
        artifacts_count = CulturalArtifact.objects.count()
        analysis_requests_count = AnalysisRequest.objects.count()
        analysis_artifacts_count = AnalysisArtifact.objects.count()
        
        self.stdout.write(f'Создано:')
        self.stdout.write(f'  - Культурных артефактов: {artifacts_count}')
        self.stdout.write(f'  - Запросов анализа: {analysis_requests_count}')
        self.stdout.write(f'  - Связей артефактов с анализами: {analysis_artifacts_count}')
        
        # Выводим информацию об основном запросе
        main_request = AnalysisRequest.objects.filter(research_title="Анализ влияния современных медиафеноменов").first()
        if main_request:
            self.stdout.write(f'\nОсновной запрос анализа:')
            self.stdout.write(f'  - Название: {main_request.research_title}')
            self.stdout.write(f'  - Исследователь: {main_request.researcher_name}')
            self.stdout.write(f'  - Статус: {main_request.status}')
            self.stdout.write(f'  - Артефактов: {main_request.artifacts.count()}')