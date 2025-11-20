import json
import os
from django.conf import settings
from django.http import JsonResponse, Http404

# ==========================================
# [1] 데이터 영역: JSON 파일 파싱 (팀장님 지시 이행)
# ==========================================

# perfume 앱 폴더 안에 있는 products.json 파일의 경로를 찾습니다.
JSON_FILE_PATH = os.path.join(settings.BASE_DIR, 'perfume', 'products.json')

def get_all_products():
    """ products.json 파일을 읽어서(파싱) 파이썬 리스트로 반환 """
    if not os.path.exists(JSON_FILE_PATH):
        return [] # 파일이 없으면 빈 리스트 반환
    
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f) # JSON 파일을 파이썬 데이터로 변환

def get_product_by_id(product_id):
    """ ID로 특정 상품을 찾는 도우미 함수 """
    products = get_all_products() # 위 함수를 이용해 데이터를 가져옴
    
    # products.json은 리스트([ ... ]) 형태이므로 반복문으로 찾아야 합니다.
    for product in products:
        if product['id'] == product_id:
            return product
    return None


# ==========================================
# [2] 뷰 함수 영역
# ==========================================

def index(request):
    data = { 'message': 'Perfume API 서버입니다. /1/ 또는 /2/로 접속해보세요.' }
    return JsonResponse(data)


def product_detail(request, product_id):
    # ★ 수정됨: MOCK 변수가 아니라, 함수를 통해 파일에서 데이터를 가져옵니다.
    product = get_product_by_id(product_id)
    
    if product is None:
        return JsonResponse({'error': f'Product ID {product_id}을(를) 찾을 수 없습니다.'}, status=404)

    return JsonResponse(product)


# [장바구니 담기]
def add_to_cart(request, product_id):
    cart = request.session.get('cart', {})
    product_to_add = str(product_id)
    
    if product_to_add in cart:
        cart[product_to_add]['quantity'] += 1
    else:
        # ★ 수정됨: JSON 파일에서 상품 정보를 가져옴
        product_info = get_product_by_id(product_id)
        
        if product_info is None:
             return JsonResponse({'error': '존재하지 않는 상품입니다.'}, status=404)
             
        cart[product_to_add] = {
            'id': product_info['id'],
            'name': product_info['name'],
            'sale_price': product_info['sale_price'],
            'quantity': 1,
        }

    request.session['cart'] = cart
    
    return JsonResponse({
        'message': f'상품(ID:{product_id})이 장바구니에 추가되었습니다.',
        'current_cart': cart
    })


# [장바구니 조회]
def view_cart(request):
    cart = request.session.get('cart', {})
    if not cart:
        return JsonResponse({'message': '장바구니가 비어있습니다.'})
    return JsonResponse(cart)


# [장바구니 삭제]
def remove_from_cart(request, product_id):
    cart = request.session.get('cart', {})
    product_to_remove = str(product_id)
    
    if product_to_remove in cart:
        del cart[product_to_remove]
        request.session['cart'] = cart
        return JsonResponse({
            'message': f'상품(ID:{product_id})이 장바구니에서 삭제되었습니다.',
            'current_cart': cart
        })
    else:
        return JsonResponse({'error': '장바구니에 해당 상품이 없습니다.'}, status=404)


# [장바구니 비우기]
def clear_cart(request):
    request.session['cart'] = {}
    return JsonResponse({'message': '장바구니를 모두 비웠습니다.'})


def order_preview(request):
    """
    장바구니에 담긴 상품들을 기반으로 '주문서(Preview)' 데이터를 생성하여 반환합니다.
    (URL: /order/preview/)
    """
    # 1. 세션에서 장바구니 가져오기
    cart = request.session.get('cart', {})
    
    # 2. 장바구니가 비어있으면 400 에러 반환
    if not cart:
        return JsonResponse({'error': '장바구니가 비어있어 주문할 수 없습니다.'}, status=400)
    
    # 3. 금액 계산 로직
    total_quantity = 0
    subtotal_price = 0
    items = []

    # 장바구니에 있는 각 상품을 하나씩 꺼내서 계산
    for item in cart.values():
        quantity = item['quantity']
        price = item['sale_price']
        total_price = price * quantity # 해당 상품 총액 (단가 * 수량)
        
        # 계산된 총액을 item 정보에 잠시 추가 (프론트엔드 편의용)
        item['total_price'] = total_price
        items.append(item)
        
        total_quantity += quantity
        subtotal_price += total_price

    # 4. 배송비 정책 (5만원 이상 무료, 아니면 3,000원)
    shipping_fee = 3000
    if subtotal_price >= 50000:
        shipping_fee = 0
    
    # 5. 최종 결제 예정 금액
    final_total_price = subtotal_price + shipping_fee
    
    # 6. 최종 주문서 데이터(JSON) 생성
    order_data = {
        'message': '주문 확인창 데이터입니다.',
        'order_items': items,             # 상품 리스트
        'subtotal_price': subtotal_price, # 총 상품 금액
        'shipping_fee': shipping_fee,     # 배송비
        'final_total_price': final_total_price, # 최종 결제 금액
        'total_quantity': total_quantity  # 총 수량
    }
    
    return JsonResponse(order_data)