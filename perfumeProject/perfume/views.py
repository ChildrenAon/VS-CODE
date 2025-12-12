
import json
import os
from django.conf import settings
from django.http import JsonResponse

JSON_FILE_PATH = os.path.join(settings.BASE_DIR, 'perfume', 'products.json')

def get_json_body(request):
    """POST 요청이면서 JSON Body 파싱"""
    try:
        return json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return {}

# ---------- 데이터 처리 (수정됨) ----------
def get_all_products_data():
    """JSON 파일 원본(Dictionary 구조)을 그대로 가져옴"""
    if not os.path.exists(JSON_FILE_PATH):
        return {} # 빈 리스트가 아니라 빈 딕셔너리 반환
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_product_by_id(product_id):
    """
    JSON이 { "Category": [목록], ... } 구조이므로
    이중 반복문을 통해 상품을 찾아야 함
    """
    data = get_all_products_data()
    # data.values()는 각 카테고리의 상품 리스트들을 의미함
    for product_list in data.values():
        for p in product_list:
            if p['id'] == product_id:
                return p
    return None

# ---------- API ----------
def index(request):
    return JsonResponse({'message': 'Welcome to Perfume POST API'})

def product_detail(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)

    data = get_json_body(request)
    product_id = data.get("product_id")

    if product_id is None:
        return JsonResponse({'error': 'product_id가 필요합니다.'}, status=400)

    # JSON에서 id는 int로 저장되어 있으므로 비교를 위해 타입 확인 필요 (보통 json.loads는 int로 변환함)
    product = get_product_by_id(product_id)
    return JsonResponse(product) if product else JsonResponse({'error': '상품 없음'}, status=404)

def add_to_cart(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)

    data = get_json_body(request)
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return JsonResponse({'error': 'product_id가 필요합니다.'}, status=400)
    if quantity < 1 or quantity > 10:
        return JsonResponse({'error': '수량은 1~10개만 가능합니다.'}, status=400)

    cart = request.session.get('cart', {})
    product_to_add = str(product_id) # Session Key는 문자열로 관리

    product = get_product_by_id(product_id)
    if not product:
        return JsonResponse({'error': '존재하지 않는 상품입니다.'}, status=404)

    if product_to_add in cart:
        cart[product_to_add]['quantity'] += quantity
    else:
        cart[product_to_add] = {
            'id': product['id'],
            'name': product['name'],
            'sale_price': product['sale_price'],
            'img': product.get('img', ''),
            'quantity': quantity,
        }

    request.session['cart'] = cart
    return JsonResponse({'message': '장바구니 추가 완료', 'cart': cart})

def view_cart(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)
    return JsonResponse(request.session.get('cart', {}))

def remove_from_cart(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)

    data = get_json_body(request)
    product_id = data.get("product_id")

    if not product_id:
        return JsonResponse({'error': 'product_id가 필요합니다.'}, status=400)

    cart = request.session.get("cart", {})
    product_key = str(product_id)

    if product_key in cart:
        del cart[product_key]
        request.session['cart'] = cart
        return JsonResponse({'message': '삭제 완료', 'cart': cart})
    
    return JsonResponse({'error': '장바구니에 없음'}, status=404)

def clear_cart(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)
    request.session['cart'] = {}
    return JsonResponse({'message': '장바구니 초기화 완료'})

def order_preview(request):
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)

    cart = request.session.get('cart', {})
    if not cart:
        return JsonResponse({'error': '장바구니 비어 있음'}, status=400)

    items = []
    subtotal = 0
    total_qty = 0

    for item in cart.values():
        price = item['sale_price']
        qty = item['quantity']
        total = price * qty

        preview_item = item.copy() 
        preview_item['total_price'] = total
        items.append(preview_item)

        subtotal += total
        total_qty += qty

    shipping = 0 if subtotal >= 50000 else 3000
    final = subtotal + shipping

    return JsonResponse({
        'order_items': items,
        'total_quantity': total_qty,
        'subtotal_price': subtotal,
        'shipping_fee': shipping,
        'final_total_price': final
    })

def product_list_by_category(request):
    """
    수정됨: 전체 리스트를 순회하는 것이 아니라,
    딕셔너리 키(카테고리명)를 통해 바로 접근하여 효율성 증대
    """
    if request.method != "POST":
        return JsonResponse({'error': 'POST로 요청하세요.'}, status=405)

    data = get_json_body(request)
    category = data.get("category")

    if not category:
        return JsonResponse({'error': 'category가 필요합니다.'}, status=400)

    all_data = get_all_products_data()
    
    # 대소문자 구분을 유연하게 하기 위해 순회 비교
    target_products = []
    for cat_key, product_list in all_data.items():
        if cat_key.lower() == category.lower():
            target_products = product_list
            break
            
    return JsonResponse(target_products, safe=False)