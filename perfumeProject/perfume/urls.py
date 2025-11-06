from django.urls import path
from . import views  # 같은 폴더의 views.py

app_name = 'perfume'  # 이 부서의 이름표

urlpatterns = [
    # "대문"에서 넘겨받은 요청 중
    # 1. '.../' (루트) 요청은 views.index가 처리
    path('', views.index, name='index'), 
    
    # 2. '.../1/' 또는 '.../2/' 요청은 views.product_detail이 처리
    path('<int:product_id>/', views.product_detail, name='product_detail'),

    # 3. 버튼 기능들
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('order-now/', views.order_now, name='order_now'),
]