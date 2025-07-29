# 🚀 빠른 AWS 배포 가이드

## 📋 사전 준비

1. **AWS CLI 설치 및 설정**
   ```bash
   aws configure
   ```

2. **Terraform 설치** (선택사항)
   ```bash
   # macOS
   brew install terraform
   
   # 또는 공식 사이트에서 다운로드
   ```

## 🎯 배포 방법 선택

### 방법 1: Terraform 사용 (권장)
```bash
cd terraform
./deploy.sh
```

### 방법 2: 수동 스크립트 사용
```bash
cd backend
./deploy.sh
```

### 방법 3: AWS 콘솔 사용
1. AWS Lambda 콘솔에서 함수 생성
2. API Gateway 콘솔에서 API 생성
3. S3 콘솔에서 버킷 생성

## 📦 프론트엔드 배포

배포 후 출력된 정보를 사용하여 프론트엔드를 배포하세요:

```bash
cd frontend
./deploy-frontend.sh "YOUR_API_URL" "YOUR_S3_BUCKET"
```

## 🔗 배포 후 확인

1. **API 테스트**
   ```bash
   curl https://YOUR_API_URL/
   ```

2. **웹사이트 접속**
   ```
   http://YOUR_S3_BUCKET.s3-website-us-east-1.amazonaws.com/
   ```

## 🗑️ 리소스 정리

### Terraform 사용 시
```bash
cd terraform
terraform destroy
```

### 수동 배포 시
```bash
# CloudFormation 스택 삭제
aws cloudformation delete-stack --stack-name number-game-stack

# S3 버킷 삭제
aws s3 rb s3://YOUR_BUCKET_NAME --force

# Lambda 함수 삭제
aws lambda delete-function --function-name number-game-api
```

## 💡 팁

- **무료 티어**: 월 1,000,000 Lambda 요청, 5GB S3 스토리지
- **비용 모니터링**: AWS Cost Explorer에서 비용 확인
- **로그 확인**: CloudWatch에서 Lambda 로그 확인
- **도메인 연결**: Route 53과 CloudFront로 커스텀 도메인 설정 가능 