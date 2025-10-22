class A:

    def func(self):
        print("x의 값을 입력받습니다.")

    @staticmethod
    def definingX():
        x = input("x = ")
        return x
    
a_instance = A()

a_instance.func()
definedX = a_instance.definingX()
print(definedX)