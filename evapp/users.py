from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from .forms import SignUp
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from .models import Users
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode  # URL 인코딩
from django.utils.encoding import force_bytes  # 바이트 변환
from django.core.mail import send_mail  # 이메일 전송
from django.conf import settings
from django.contrib.auth.views import PasswordResetView
from django.urls import reverse_lazy
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def signup(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        form = SignUp(request.POST)
        if form.is_valid():
            user = form.save(commit=False)  # 저장을 미뤄서 해싱을 먼저 처리
            user.set_password(form.cleaned_data['password'])  # 비밀번호 해싱
            user.is_active = False  # 이메일 인증 전까지 계정을 비활성화
            user.save()

            # 이메일 인증 링크 생성 및 발송
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verification_link = request.build_absolute_uri(f'/activate/{uid}/{token}/')

            subject = '이메일 인증을 완료하세요'
            message = f'회원가입을 완료하려면 다음 링크를 클릭하세요: {verification_link}'
            recipient_list = [user.email]
            send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)

            messages.success(request, '이메일 인증 링크가 발송되었습니다. 이메일을 확인하세요.')
            return redirect('/')  # 홈 페이지로 이동
    else:
        form = SignUp()

    return render(request, 'signup.html', {'form': form})

def activate_account(request, uidb64, token):
    try:
        uid = smart_str(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Users.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, '이메일 인증이 완료되었습니다.')
        return redirect('login')  # 로그인 페이지로 리다이렉트
    else:
        return HttpResponse('링크가 유효하지 않거나 만료되었습니다.')

class CustomPasswordResetView(PasswordResetView):
    template_name = 'password_reset.html'
    email_template_name = 'password_reset_email.html'
    success_url = reverse_lazy('password_reset')
    subject_template_name = 'password_reset_subject.txt'
    from_email = settings.EMAIL_HOST_USER

    def form_valid(self, form):
        messages.success(self.request, '비밀번호 재설정 링크가 이메일로 전송되었습니다.')
        return super().form_valid(form)

# 로그인 로직
def userLogin(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'GET':

        return render(request, 'login.html')

    elif request.method == 'POST':

        userid = request.POST.get('userid')
        password = request.POST.get('password')

        user = authenticate(request, userid=userid, password=password)

        if user is not None:
            if user.is_active:
                login(request, user=user)
                return redirect('home')
            else:
                messages.error(request, "비활성화된 계정입니다. 관리자에게 문의하세요.")
                return redirect('login')
        else:
            messages.error(request, "아이디 혹은 비밀번호가 틀렸습니다.")
            return redirect('login')

def find_userid(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = Users.objects.get(email=email)
            subject = '아이디 찾기'
            message = f'회원님의 아이디는   {user.userid}   입니다.'
            send_mail(subject, message, settings.EMAIL_HOST_USER, [email])
            messages.success(request, '아이디가 이메일로 발송되었습니다.')
        except Users.DoesNotExist:
            messages.error(request, '등록된 이메일을 찾을 수 없습니다.')
        return redirect('login')
    return render(request, 'find_userid.html')

def userLogout(request):
    logout(request)  # 세션 종료 (로그아웃 처리)
    return redirect('/')  # 로그아웃 후 홈 페이지로 리다이렉트

@login_required(login_url='/login/')
def mypage(request):
    user = request.user
    return render(request, 'mypage.html', {'user': user})

@login_required(login_url='/login/')
def update_password(request):
    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if check_password(new_password, request.user.password):
            messages.error(request, '새 비밀번호가 기존 비밀번호와 같습니다. 다시 입력해주세요.')
        elif new_password and new_password == confirm_password:
            request.user.set_password(new_password)
            request.user.save()
            messages.success(request, '비밀번호가 성공적으로 변경되었습니다.')
            logout(request)  # 로그아웃 처리
            messages.info(request, '다시 로그인 해주세요.')
            return redirect('login')  # 로그아웃 후 로그인 페이지로 리다이렉트
        else:
            messages.error(request, '비밀번호가 일치하지 않습니다.')

    return redirect('mypage')

@login_required(login_url='/login/')
def update_name(request):
    if request.method == 'POST':
        new_name = request.POST.get('new_name')
        if new_name == request.user.name:
            messages.error(request, '새 이름이 기존 이름과 같습니다.')
        elif new_name:
            request.user.name = new_name
            request.user.save()
            messages.success(request, '이름이 성공적으로 변경되었습니다.')

    return redirect('mypage')

@login_required(login_url='/login/')
def update_email(request):
    if request.method == 'POST':
        new_email = request.POST.get('new_email')
        if new_email == request.user.email:
            messages.error(request, '새 이메일이 기존 이메일과 같습니다.')
        elif new_email:
            request.user.email = new_email
            request.user.save()
            messages.success(request, '이메일이 성공적으로 변경되었습니다.')

    return redirect('mypage')

@login_required(login_url='/login/')
def update_address(request):
    if request.method == 'POST':
        address = request.POST.get('address')
        address_detail = request.POST.get('address_detail')

        # 현재 로그인한 사용자의 주소 업데이트
        request.user.address = address
        request.user.address_detail = address_detail
        request.user.save()

        messages.success(request, '주소가 성공적으로 변경되었습니다.')
        return redirect('mypage')

@login_required(login_url='/login/')
def delete_user(request, user_id):
    user = get_object_or_404(Users, id=user_id)  # 유저가 존재하지 않으면 404 에러 발생

    if request.user == user:
        if request.method == 'POST':
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            # 비밀번호 일치 여부 확인
            if password != confirm_password:
                messages.error(request, '비밀번호가 일치하지 않습니다.')
                return redirect('mypage')  # 비밀번호가 일치하지 않으면 마이페이지로 리다이렉트

            # 현재 유저 비밀번호와 비교
            if check_password(password, user.password):
                # 비밀번호가 일치하면 계정 비활성화 처리
                user.is_active = False
                user.delete_at = timezone.now()  # 삭제 시간 기록 (필요 시)
                user.save()
                logout(request)  # 로그아웃 처리
                messages.success(request, '계정이 삭제되었습니다.')
                return redirect('home')  # 성공적으로 비활성화되면 홈 페이지로 리다이렉트
            else:
                messages.error(request, '비밀번호가 틀렸습니다.')
                return redirect('mypage')  # 비밀번호가 틀리면 마이페이지로 리다이렉트
    else:
        messages.error(request, '다른 사용자의 계정을 삭제할 수 없습니다.')
        return redirect('mypage')