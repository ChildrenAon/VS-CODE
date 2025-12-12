N = input()

if len(N)%2 == 0:

    half = len(N)//2
    left = N[:half1]
    right = N[half:]

    left_result = 0
    right_result = 0

    for i in range(0,len(left)):
        left_result += int(left[i])
    
    for i in range(0, len(right)):
        right_result += int(right[i])

    if left_result == right_result:
        print("LUCKY")
    else:
        print("READY")
