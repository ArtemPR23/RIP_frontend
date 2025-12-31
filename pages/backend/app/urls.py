from django.urls import path
from .views import *

urlpatterns = [
    # Набор методов для культурных артефактов
    path('api/artifacts/', search_artifacts),  # GET
    path('api/artifacts/<int:artifact_id>/', get_artifact_by_id),  # GET
    path('api/artifacts/<int:artifact_id>/update/', update_artifact),  # PUT
    path('api/artifacts/<int:artifact_id>/update_image/', update_artifact_image),  # POST
    path('api/artifacts/<int:artifact_id>/delete/', delete_artifact),  # DELETE
    path('api/artifacts/create/', create_artifact),  # POST
    path('api/artifacts/<int:artifact_id>/add_to_analysis/', add_artifact_to_analysis),  # POST

    # Набор методов для запросов анализа
    path('api/analysis_requests/', search_analysis_requests),  # GET
    path('api/analysis_requests/<int:analysis_request_id>/', get_analysis_request_by_id),  # GET
    path('api/analysis_requests/<int:analysis_request_id>/update/', update_analysis_request),  # PUT
    path('api/analysis_requests/<int:analysis_request_id>/update_status_user/', update_status_user),  # PUT
    path('api/analysis_requests/<int:analysis_request_id>/update_status_admin/', update_status_admin),  # PUT
    path('api/analysis_requests/<int:analysis_request_id>/delete/', delete_analysis_request),  # DELETE

    # Набор методов для м-м
    # path('api/analysis_requests/<int:analysis_requests>/update_artifact/<int:artifact_id>/', get_sample_mission),  # GET
    path('api/analysis_requests/<int:analysis_request_id>/update_artifact/<int:artifact_id>/', update_artifact_in_analysis),  # PUT
    path('api/analysis_requests/<int:analysis_request_id>/delete_artifact/<int:artifact_id>/', delete_artifact_from_analysis),  # DELETE

    # Набор методов пользователей
    path('api/users/register/', register), # POST
    path('api/users/login/', login), # POST
    path('api/users/logout/', logout), # POST
    path('api/users/<int:user_id>/update/', update_user), # PUT

    path('api/get_cart_icon/', get_cart_icon), # GET
    
]