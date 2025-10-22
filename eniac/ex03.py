class N:

    def ur(self):
        print("You are ")
    
    @staticmethod
    def name():
        x = input("이름을 입력해주세요: ")
        return x

user_name = N()


y = user_name.name()
result = user_name.ur()
print(y)