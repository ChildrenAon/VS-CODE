from django.urls import path
from . import views

app_name = 'perfume'

urlpatterns = [
    # 기존 URL (그대로 둡니다)
    path('', views.index, name='index'),
    path('<int:product_id>/', views.product_detail, name='product_detail'),
    
    # --- ★★★ 수정된 URL ★★★ ---
    # (예: /add-to-cart/1/ 또는 /add-to-cart/2/)
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    
    # --- ★★★ 신규 URL ★★★ ---
    # (예: /cart/)
    path('cart/', views.view_cart, name='view_cart'),

    # --- ★★★ [장바구니 기능: 삭제 & 비우기] (누락되었던 부분) ★★★ ---
    # 특정 상품 1개 삭제 (예: /cart/remove/1/)
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # 장바구니 전체 비우기 (예: /cart/clear/)
    path('cart/clear/', views.clear_cart, name='clear_cart'),
    
    # --- ★★★ [미션 2] 주문 확인창 URL (신규 추가) ★★★ ---
    # (예: /order/preview/)
    path('order/preview/', views.order_preview, name='order_preview'),
    
]