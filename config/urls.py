"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from evapp.views import homepage, mapTest, verses, getCar, getSpec, price, getOil, getCity, getSubsidy, ev_test, evPage, hybridPage, evFilter_check, charger500, ev_result, searchPage
from evapp.users import signup, userLogin, userLogout, mypage, update_password, update_name, update_email, update_address, delete_user, activate_account, find_userid, CustomPasswordResetView
from django.contrib.auth.views import PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', homepage, name='home'),
    path('map/', mapTest),
    path('signup/', signup),
    path('activate/<uidb64>/<token>/', activate_account, name='activate'),
    path('login/', userLogin, name='login'),
    path('logout/', userLogout, name='logout'),
    path('mypage/', mypage, name='mypage'),
    path('mypage/edit/password', update_password, name='update_password'),  # 여기서 'update_password'가 정의됨
    path('mypage/edit/name', update_name, name='update_name'),
    path('mypage/edit/email', update_email, name='update_email'),
    path('mypage/edit/address', update_address, name='update_address'),
    path('mypage/delete/<int:user_id>/', delete_user, name='delete_user'),
    path('verses/', verses, name='verses'),
    path('api/car/', getCar, name='getCar'),
    path('api/spec/', getSpec, name='getSpec'),
    path('price/', price, name='price'),
    path('api/oil/', getOil, name='getOil'),
    path('api/city/', getCity, name='getCity'),
    path('api/subsidy/', getSubsidy, name='getSubsidy'),
    path('evtest/', ev_test, name='ev_test'),
    path('evtest/result/', evPage, name='evPage'),
    path('evtest/result/hybrid/', hybridPage, name='hybridPage'),
    path('evtest/evfilter/', evFilter_check, name='evFilter_check'),
    path('api/charger500/', charger500, name='charger500'),
    path('evtest/result2/', ev_result, name='ev_result'),
    path('search/', searchPage, name='searchPage'),
    path('find_userid/', find_userid, name='find_userid'),
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset_done/', PasswordResetDoneView.as_view(template_name='password_reset_done.html'), name='password_reset_done'),
    path('password_reset_confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'), name='password_reset_confirm'),
    path('password_reset_complete/', PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'), name='password_reset_complete'),




]
