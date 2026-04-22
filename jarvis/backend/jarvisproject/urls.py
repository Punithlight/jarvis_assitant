from django.urls import path
from jarvisapp import views

urlpatterns = [
    path('api/chat/', views.process_command),
    path('api/history/', views.get_history),
    path('api/history/clear/', views.clear_history),
]
