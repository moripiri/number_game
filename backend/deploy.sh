#!/bin/bash

# AWS Lambda + API Gateway + S3 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 환경 변수 설정 (실제 값으로 변경 필요)
STACK_NAME="number-game-stack"
BUCKET_NAME="number-game-frontend-$(date +%s)"
LAMBDA_FUNCTION_NAME="number-game-api"
REGION="us-east-1"

echo -e "${BLUE}🚀 Number Game AWS 배포 시작${NC}"

# 1. Lambda 배포 패키지 빌드
echo -e "${YELLOW}📦 Lambda 배포 패키지 빌드 중...${NC}"
python build_lambda.py

# 2. S3 버킷 생성 (프론트엔드용)
echo -e "${YELLOW}🪣 S3 버킷 생성 중...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# 3. S3 버킷 공개 액세스 설정 해제
echo -e "${YELLOW}🔓 S3 버킷 공개 액세스 설정 해제 중...${NC}"
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 4. S3 버킷을 정적 웹사이트로 설정
echo -e "${YELLOW}🌐 S3 정적 웹사이트 설정 중...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# 5. S3 버킷 정책 설정 (공개 읽기 권한)
echo -e "${YELLOW}🔓 S3 버킷 정책 설정 중...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# 5. CloudFormation 템플릿 생성
echo -e "${YELLOW}📋 CloudFormation 템플릿 생성 중...${NC}"
cat > cloudformation-template.yaml << EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Number Game - Lambda + API Gateway Stack'

Parameters:
  BucketName:
    Type: String
    Default: '$BUCKET_NAME'
    Description: S3 bucket name for frontend

Resources:
  # Lambda Function
  NumberGameFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: $LAMBDA_FUNCTION_NAME
      Runtime: python3.9
      Handler: lambda_function.lambda_handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          import json
          def lambda_handler(event, context):
              return {
                  'statusCode': 200,
                  'body': json.dumps({'message': 'Lambda function created successfully'})
              }
      Timeout: 30
      MemorySize: 512
      Environment:
        Variables:
          PYTHONPATH: /opt/python

  # Lambda Execution Role
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

  # API Gateway
  NumberGameApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: NumberGameAPI
      Description: API Gateway for Number Game

  # API Gateway Resource
  ApiResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref NumberGameApi
      ParentId: !GetAtt NumberGameApi.RootResourceId
      PathPart: '{proxy+}'

  # API Gateway Method
  ApiMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref NumberGameApi
      ResourceId: !Ref ApiResource
      HttpMethod: ANY
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${NumberGameFunction.Arn}/invocations

  # Lambda Permission for API Gateway
  LambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref NumberGameFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${NumberGameApi}/*/*

  # API Gateway Deployment
  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn: ApiMethod
    Properties:
      RestApiId: !Ref NumberGameApi
      StageName: prod

Outputs:
  ApiUrl:
    Description: API Gateway URL
    Value: !Sub https://${NumberGameApi}.execute-api.${AWS::Region}.amazonaws.com/prod/
  
  S3WebsiteUrl:
    Description: S3 Website URL
    Value: !Sub http://${BucketName}.s3-website-${AWS::Region}.amazonaws.com/

EOF

# 6. CloudFormation 스택 배포
echo -e "${YELLOW}☁️ CloudFormation 스택 배포 중...${NC}"
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=BucketName,ParameterValue=$BUCKET_NAME \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo -e "${YELLOW}⏳ 스택 배포 완료 대기 중...${NC}"
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION

# 7. Lambda 함수 코드 업데이트
echo -e "${YELLOW}🔄 Lambda 함수 코드 업데이트 중...${NC}"
aws lambda update-function-code \
  --function-name $LAMBDA_FUNCTION_NAME \
  --zip-file fileb://lambda_deploy.zip \
  --region $REGION

# 8. 출력 정보 표시
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${BLUE}📊 배포 정보:${NC}"
echo -e "  S3 버킷: $BUCKET_NAME"
echo -e "  Lambda 함수: $LAMBDA_FUNCTION_NAME"
echo -e "  CloudFormation 스택: $STACK_NAME"

# API Gateway URL 가져오기
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --region $REGION)

echo -e "  API Gateway URL: $API_URL"

# 정리
rm -f bucket-policy.json cloudformation-template.yaml lambda_deploy.zip

echo -e "${YELLOW}📝 다음 단계:${NC}"
echo -e "  1. 프론트엔드 빌드: cd ../frontend && npm run build"
echo -e "  2. S3에 업로드: aws s3 sync build/ s3://$BUCKET_NAME"
echo -e "  3. 프론트엔드 API URL 업데이트: $API_URL" 