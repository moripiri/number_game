# AWS Lambda + API Gateway + S3 배포 가이드

이 가이드는 Number Game 프로젝트를 AWS 무료 티어를 사용하여 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

### 1. AWS 계정 설정
- AWS 계정 생성
- AWS CLI 설치 및 설정
- IAM 사용자 생성 (프로그래밍 방식 액세스)

### 2. AWS CLI 설정
```bash
aws configure
```
다음 정보를 입력하세요:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1` (무료 티어 권장)
- Default output format: `json`

### 3. 필요한 권한
IAM 사용자에게 다음 권한이 필요합니다:
- Lambda 관련 권한
- API Gateway 관련 권한
- S3 관련 권한
- CloudFormation 관련 권한
- IAM 관련 권한 (역할 생성용)

## 🚀 배포 단계

### 1단계: 백엔드 배포 (Lambda + API Gateway)

```bash
cd backend
./deploy.sh
```

이 스크립트는 다음을 수행합니다:
- Lambda 배포 패키지 빌드
- S3 버킷 생성 (프론트엔드용)
- CloudFormation 스택 배포
- Lambda 함수 코드 업데이트

### 2단계: 프론트엔드 배포 (S3)

```bash
cd frontend
./deploy-frontend.sh "https://YOUR_API_GATEWAY_URL" "YOUR_S3_BUCKET_NAME"
```

예시:
```bash
./deploy-frontend.sh "https://abc123.execute-api.us-east-1.amazonaws.com/prod/" "number-game-frontend-1234567890"
```

## 📊 무료 티어 한도

### Lambda
- 월 1,000,000 요청
- 월 400,000 GB-초 컴퓨팅 시간
- 함수당 최대 15분 실행 시간

### API Gateway
- 월 1,000,000 API 호출
- 월 750,000 연결 분

### S3
- 월 5GB 스토리지
- 월 20,000 GET 요청
- 월 2,000 PUT 요청

## 🔧 수동 배포 (스크립트 사용 불가 시)

### 1. Lambda 함수 생성

```bash
# 배포 패키지 빌드
cd backend
python build_lambda.py

# Lambda 함수 생성
aws lambda create-function \
  --function-name number-game-api \
  --runtime python3.9 \
  --handler lambda_function.lambda_handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda_deploy.zip \
  --timeout 30 \
  --memory-size 512
```

### 2. API Gateway 생성

```bash
# REST API 생성
aws apigateway create-rest-api \
  --name "NumberGameAPI" \
  --description "API Gateway for Number Game"

# 리소스 및 메서드 설정
# (복잡하므로 AWS 콘솔 사용 권장)
```

### 3. S3 버킷 설정

```bash
# 버킷 생성
aws s3 mb s3://number-game-frontend-YOUR_UNIQUE_NAME

# 정적 웹사이트 설정
aws s3 website s3://number-game-frontend-YOUR_UNIQUE_NAME \
  --index-document index.html \
  --error-document index.html

# 버킷 정책 설정
aws s3api put-bucket-policy \
  --bucket number-game-frontend-YOUR_UNIQUE_NAME \
  --policy file://bucket-policy.json
```

## 🔍 문제 해결

### 일반적인 문제들

1. **Lambda 함수 크기 제한**
   - 문제: 배포 패키지가 50MB 초과
   - 해결: 불필요한 의존성 제거, Lambda Layer 사용

2. **CORS 오류**
   - 문제: 브라우저에서 API 호출 실패
   - 해결: API Gateway에서 CORS 설정 확인

3. **권한 오류**
   - 문제: Lambda 함수 실행 실패
   - 해결: IAM 역할 권한 확인

### 로그 확인

```bash
# Lambda 로그 확인
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/number-game-api"

# API Gateway 로그 확인
aws apigateway get-rest-api --rest-api-id YOUR_API_ID
```

## 💰 비용 최적화

### 무료 티어 내에서 유지하는 팁

1. **Lambda 최적화**
   - 메모리 할당 최소화 (128MB)
   - 함수 실행 시간 최소화
   - 불필요한 의존성 제거

2. **API Gateway 최적화**
   - 캐싱 활성화
   - 불필요한 API 호출 최소화

3. **S3 최적화**
   - 파일 압축
   - 불필요한 파일 제거

## 🔄 업데이트 배포

### 백엔드 업데이트
```bash
cd backend
python build_lambda.py
aws lambda update-function-code \
  --function-name number-game-api \
  --zip-file fileb://lambda_deploy.zip
```

### 프론트엔드 업데이트
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR_BUCKET_NAME --delete
```

## 🗑️ 리소스 정리

### 모든 리소스 삭제
```bash
# CloudFormation 스택 삭제
aws cloudformation delete-stack --stack-name number-game-stack

# S3 버킷 삭제
aws s3 rb s3://YOUR_BUCKET_NAME --force

# Lambda 함수 삭제
aws lambda delete-function --function-name number-game-api
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. AWS CLI 설정
2. IAM 권한
3. 리소스 한도
4. 로그 메시지

## 🔗 유용한 링크

- [AWS Lambda 개발자 가이드](https://docs.aws.amazon.com/lambda/latest/dg/)
- [API Gateway 개발자 가이드](https://docs.aws.amazon.com/apigateway/latest/developerguide/)
- [S3 개발자 가이드](https://docs.aws.amazon.com/s3/)
- [AWS 무료 티어](https://aws.amazon.com/free/) 