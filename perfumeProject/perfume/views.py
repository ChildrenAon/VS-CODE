from django.shortcuts import render
from django.http import Http404

# --- 1. 가짜 데이터 (Mock Data) 수정 ---
# 가격(price) 필드를 쉼표 없는 '숫자'로 수정했습니다. (예: '5,800' -> 5800)
MOCK_PRODUCT_LIST = {
    1: {
        'id': 1,
        'name': '[스윗던] 스윗던 뉴 스탠다드 펌핑식 충전 향수공병 5ml',
        'original_price': 10000,   # '10,000' -> 10000
        'sale_price': 5800,        # '5,800' -> 5800
        'special_notes': '5ml 향수공병 (리필용)',
        'promotion_price_info': '5,800원', # 이건 화면 표시용이라 문자열 유지
        'options': ['블랙', '실버', '블루', '그린', '핑크', '골드', '퍼플', '레드', '화이트'],
        'main_image_filename': 'perfume_main.jpg',
        'detail_image_filename': 'perfume_detail.jpg',
    },
    2: { # 다른 상품 예시 (혹시 테스트해볼 경우)
        'id': 2,
        'name': '두 번째 테스트 향수 10ml',
        'original_price': 20000,
        'sale_price': 15000,
        'special_notes': '10ml 대용량',
        'promotion_price_info': '15,000원',
        'options': ['블랙', '골드', '레드'],
        'main_image_filename': 'perfume_main.jpg', # 이미지는 임시로 동일하게 사용
        'detail_image_filename': 'perfume_detail.jpg',
    }
}


# --- 2. 뷰 함수들 (수정 없음, 그대로 유지) ---

# 2-1. (참고) index 뷰: '/' (루트 페이지)
def index(request):
    # 나중에 홈페이지를 만들 때 여기를 수정합니다.
    # 지금은 1번 상품 페이지로 바로 이동하는 링크를 보여줍니다.
    return render(request, 'index.html')


# 2-2. product_detail 뷰: '/1/', '/2/' (제품 상세 페이지)
def product_detail(request, product_id):
    """
    제품 상세 페이지를 보여주는 뷰 함수
    """
    try:
        # 1. Mock Data에서 product_id에 해당하는 제품 정보를 찾습니다.
        product = MOCK_PRODUCT_LIST[product_id]
        
    except KeyError:
        # 2. 만약 해당 ID의 제품이 없으면(예: 99번), 404 에러를 발생시킵니다.
        raise Http404("제품을 찾을 수 없습니다.")

    # 3. 'context' 딕셔너리에 'product'라는 이름으로 데이터를 담아 템플릿으로 전달합니다.
    context = {
        'product': product,
    }

    # 4. 'product_detail.html' 템플릿을 렌더링하여 사용자에게 보여줍니다.
    # (index.html과 다른, 새로운 HTML 파일입니다.)
    return render(request, 'product_detail.html', context)


# 2-3. (신규) 버튼 기능(장바구니/주문)을 위한 임시 뷰
# 지금은 버튼을 눌렀을 때 "준비 중" 페이지만 보여줍니다.
def add_to_cart(request):
    return render(request, 'coming_soon.html', {'feature_name': '장바구니'})

def order_now(request):
    return render(request, 'coming_soon.html', {'feature_name': '주문하기'})