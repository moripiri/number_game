#!/bin/bash

# 프론트엔드 S3 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 환경 변수 설정
API_URL=${1:-"http://localhost:8000"}
BUCKET_NAME=${2:-"number-game-frontend"}

echo -e "${BLUE}🌐 Number Game 프론트엔드 배포 시작${NC}"

# 1. 환경 변수 설정
echo -e "${YELLOW}🔧 환경 변수 설정 중...${NC}"
echo "REACT_APP_API_URL=$API_URL" > .env.production

# 2. 의존성 설치
echo -e "${YELLOW}📥 의존성 설치 중...${NC}"
npm install

# 3. 프로덕션 빌드
echo -e "${YELLOW}🔨 프로덕션 빌드 중...${NC}"
npm run build

# 4. S3에 업로드
echo -e "${YELLOW}📤 S3에 업로드 중...${NC}"
aws s3 sync build/ s3://$BUCKET_NAME --delete

# 5. CloudFront 캐시 무효화 (선택사항)
echo -e "${YELLOW}🔄 CloudFront 캐시 무효화 중...${NC}"
# CloudFront Distribution ID가 있다면 주석 해제
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# 6. 정리
rm -f .env.production

echo -e "${GREEN}✅ 프론트엔드 배포 완료!${NC}"
echo -e "${BLUE}📊 배포 정보:${NC}"
echo -e "  S3 버킷: $BUCKET_NAME"
echo -e "  API URL: $API_URL"
echo -e "  웹사이트 URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com/"

echo -e "${YELLOW}📝 참고사항:${NC}"
echo -e "  - S3 버킷이 정적 웹사이트로 설정되어 있어야 합니다"
echo -e "  - 버킷 정책이 공개 읽기 권한을 허용해야 합니다"
echo -e "  - CloudFront를 사용하면 HTTPS와 커스텀 도메인을 사용할 수 있습니다" 