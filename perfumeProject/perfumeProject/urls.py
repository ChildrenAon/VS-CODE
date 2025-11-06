"""
URL configuration for perfumeProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/'  , include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include  # <-- include 임포트

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # (스크린샷에 있던 path('', views.index)는 삭제합니다)

    # '/' (루트 URL)로 오는 요청을 perfume 앱의 urls.py로 넘깁니다.
    path('', include('perfume.urls')), 
    
    # 만약 'products/'로 시작하게 하고 싶다면,
    # path('products/', include('perfume.urls')),
    # 이렇게 하시면 됩니다. (팀장님과 상의)
    # 여기서는 루트('')로 가정합니다.
]