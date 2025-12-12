from django.urls import path
from . import views

app_name = 'perfume'

urlpatterns = [
    path('', views.index, name='index'),
    
    path('product/', views.product_detail, name='product_detail'),
    
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('cart/view/', views.view_cart, name='view_cart'),
    path('cart/remove/', views.remove_from_cart, name='remove_from_cart'),
    path('cart/clear/', views.clear_cart, name='clear_cart'),

    path('order/preview/', views.order_preview, name='order_preview'),

    path('products/category/', views.product_list_by_category, name='product_list_by_category'),
]
