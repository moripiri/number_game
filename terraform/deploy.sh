#!/bin/bash

# Terraform을 사용한 AWS 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Terraform을 사용한 Number Game AWS 배포${NC}"

# 1. Lambda 배포 패키지 빌드
echo -e "${YELLOW}📦 Lambda 배포 패키지 빌드 중...${NC}"
cd ../backend
python build_lambda.py
cd ../terraform

# 2. Terraform 초기화
echo -e "${YELLOW}🔧 Terraform 초기화 중...${NC}"
terraform init

# 3. Terraform 계획 확인
echo -e "${YELLOW}📋 Terraform 계획 확인 중...${NC}"
terraform plan

# 4. 사용자 확인
echo -e "${YELLOW}❓ 계속하시겠습니까? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 배포가 취소되었습니다.${NC}"
    exit 1
fi

# 5. Terraform 적용
echo -e "${YELLOW}☁️ AWS 리소스 생성 중...${NC}"
terraform apply -auto-approve

# 6. 출력 정보 표시
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${BLUE}📊 배포 정보:${NC}"

API_URL=$(terraform output -raw api_url)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
S3_WEBSITE_URL=$(terraform output -raw s3_website_url)

echo -e "  API Gateway URL: $API_URL"
echo -e "  S3 버킷: $S3_BUCKET"
echo -e "  S3 웹사이트 URL: $S3_WEBSITE_URL"

# 7. 프론트엔드 배포 안내
echo -e "${YELLOW}📝 다음 단계:${NC}"
echo -e "  프론트엔드 배포:"
echo -e "    cd ../frontend"
echo -e "    ./deploy-frontend.sh \"$API_URL\" \"$S3_BUCKET\""

# 8. 환경 변수 파일 생성
echo -e "${YELLOW}💾 환경 변수 파일 생성 중...${NC}"
cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=$API_URL
EOF

echo -e "${GREEN}✅ 환경 변수 파일이 생성되었습니다: ../frontend/.env.production${NC}" 