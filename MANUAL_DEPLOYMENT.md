# 🖥️ AWS 콘솔을 사용한 수동 배포 가이드

AWS CLI 스크립트 대신 AWS 웹 콘솔을 사용하여 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **Lambda 배포 패키지 준비**
   ```bash
   cd backend
   python build_lambda.py
   ```
   - `lambda_deploy.zip` 파일이 생성됩니다.

## 🚀 단계별 배포

### 1단계: IAM 역할 생성

1. **AWS IAM 콘솔** 접속
2. **역할** → **역할 만들기** 클릭
3. **신뢰할 수 있는 엔티티 유형**: AWS 서비스
4. **사용 사례**: Lambda
5. **권한 정책**: `AWSLambdaBasicExecutionRole` 선택
6. **역할 이름**: `number-game-lambda-role`
7. **역할 만들기** 클릭

### 2단계: Lambda 함수 생성

1. **AWS Lambda 콘솔** 접속
2. **함수 만들기** 클릭
3. **함수 이름**: `number-game-api`
4. **런타임**: Python 3.9
5. **아키텍처**: x86_64
6. **실행 역할**: 기존 역할 사용 → `number-game-lambda-role` 선택
7. **함수 만들기** 클릭
8. **코드** 탭에서 **업로드** → **.zip 파일** 선택
9. `lambda_deploy.zip` 파일 업로드
10. **배포** 클릭

### 3단계: API Gateway 생성

1. **AWS API Gateway 콘솔** 접속
2. **API 빌드** 클릭
3. **REST API** 선택 → **구축** 클릭
4. **API 이름**: `NumberGameAPI`
5. **API 만들기** 클릭
6. **리소스** → **작업** → **리소스 만들기**
7. **리소스 이름**: `{proxy+}`
8. **리소스 경로**: `{proxy+}`
9. **리소스 만들기** 클릭
10. **작업** → **메서드 만들기**
11. **ANY** 선택 → **체크 표시**
12. **통합 유형**: Lambda 함수
13. **Lambda 함수**: `number-game-api`
14. **저장** 클릭
15. **Lambda 함수 호출 권한 부여** → **확인**

### 4단계: API 배포

1. **작업** → **API 배포**
2. **배포 스테이지**: `prod`
3. **배포** 클릭
4. **호출 URL** 복사 (예: `https://abc123.execute-api.us-east-1.amazonaws.com/prod/`)

### 5단계: S3 버킷 생성

1. **AWS S3 콘솔** 접속
2. **버킷 만들기** 클릭
3. **버킷 이름**: `number-game-frontend-YYYYMMDDHHMMSS` (고유한 이름)
4. **지역**: US East (N. Virginia)
5. **퍼블릭 액세스 차단**: 모든 퍼블릭 액세스 차단 해제
6. **버킷 만들기** 클릭

### 6단계: S3 정적 웹사이트 설정

1. 생성된 버킷 클릭
2. **속성** 탭
3. **정적 웹사이트 호스팅** → **편집**
4. **정적 웹사이트 호스팅**: 사용
5. **인덱스 문서**: `index.html`
6. **오류 문서**: `index.html`
7. **변경 사항 저장**

### 7단계: S3 버킷 정책 설정

1. **권한** 탭
2. **버킷 정책** → **편집**
3. 다음 정책 입력:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

4. **변경 사항 저장**

## 📦 프론트엔드 배포

### 1단계: 프론트엔드 빌드

```bash
cd frontend
echo "REACT_APP_API_URL=https://YOUR_API_GATEWAY_URL" > .env.production
npm install
npm run build
```

### 2단계: S3에 업로드

1. **AWS S3 콘솔**에서 생성한 버킷 클릭
2. **업로드** 클릭
3. `build/` 폴더의 모든 파일 선택
4. **업로드** 클릭

### 3단계: 웹사이트 접속

S3 웹사이트 URL로 접속:
```
http://YOUR_BUCKET_NAME.s3-website-us-east-1.amazonaws.com/
```

## 🔧 CORS 설정 (필요시)

API Gateway에서 CORS 오류가 발생하면:

1. **API Gateway 콘솔**에서 API 선택
2. **리소스** → **{proxy+}** 선택
3. **작업** → **CORS 활성화**
4. **허용된 헤더**: `*`
5. **허용된 메서드**: `*`
6. **허용된 원본**: `*`
7. **CORS 활성화 및 기존 CORS 헤더 교체**

## 🗑️ 리소스 정리

### Lambda 함수 삭제
1. **Lambda 콘솔** → 함수 선택 → **삭제**

### API Gateway 삭제
1. **API Gateway 콘솔** → API 선택 → **작업** → **API 삭제**

### S3 버킷 삭제
1. **S3 콘솔** → 버킷 선택 → **삭제**

### IAM 역할 삭제
1. **IAM 콘솔** → **역할** → 역할 선택 → **역할 삭제**

## 💡 팁

- **비용 모니터링**: AWS Cost Explorer에서 비용 확인
- **로그 확인**: CloudWatch에서 Lambda 로그 확인
- **도메인 연결**: Route 53과 CloudFront로 커스텀 도메인 설정 가능
- **HTTPS**: CloudFront를 사용하면 HTTPS 지원 가능 