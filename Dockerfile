# Python 3.12-slim 베이스 이미지 사용
FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# 로컬 디렉토리의 파일을 컨테이너로 복사
COPY . /app

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# Gunicorn으로 애플리케이션 실행
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "ev.wsgi:application"]
