# 🔧 502 Internal Server Error 해결 가이드

## 🚨 502 오류 원인

502 Internal Server Error는 주로 다음 원인들로 발생합니다:

1. **Lambda 함수 코드 오류**
2. **의존성 문제**
3. **메모리/타임아웃 문제**
4. **권한 문제**
5. **API Gateway 설정 문제**

## 🛠️ 해결 방법

### 방법 1: 간단한 테스트 함수로 교체

#### 1단계: 간단한 Lambda 함수 업로드

1. **AWS Lambda 콘솔** 접속
2. `number-game-api` 함수 선택
3. **코드** 탭 클릭
4. **업로드** → **.zip 파일** 선택
5. `lambda_simple_deploy.zip` 파일 업로드
6. **배포** 클릭

#### 2단계: API 테스트

```bash
# 헬스 체크
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/

# 응답 예시:
{
  "status": "healthy",
  "message": "Number Game API is running",
  "path": "/"
}
```

### 방법 2: CloudWatch 로그 확인

#### 1단계: 로그 그룹 확인

1. **AWS CloudWatch 콘솔** 접속
2. **로그 그룹** → `/aws/lambda/number-game-api` 선택
3. 최신 로그 스트림 클릭
4. 오류 메시지 확인

#### 2단계: 일반적인 오류 메시지

```
ImportError: No module named 'app'
```
→ 의존성 문제

```
ModuleNotFoundError: No module named 'mangum'
```
→ 패키지 누락

```
TimeoutError: Function timed out
```
→ 타임아웃 설정 문제

### 방법 3: Lambda 함수 설정 확인

#### 1단계: 기본 설정 확인

1. **Lambda 콘솔** → 함수 선택
2. **구성** 탭 → **일반 구성** → **편집**
3. 다음 설정 확인:
   - **메모리**: 512 MB (권장)
   - **제한 시간**: 30초
   - **에포크 시간**: 0초

#### 2단계: 환경 변수 설정

```
PYTHONPATH=/opt/python
```

### 방법 4: API Gateway 설정 확인

#### 1단계: 통합 설정 확인

1. **API Gateway 콘솔** → API 선택
2. **리소스** → `{proxy+}` 선택
3. **ANY** 메서드 클릭
4. **통합 요청** 클릭
5. 다음 설정 확인:
   - **통합 유형**: Lambda 함수
   - **Lambda 함수**: `number-game-api`
   - **Lambda 프록시 통합 사용**: ✓

#### 2단계: CORS 설정

1. `{proxy+}` 리소스 선택
2. **작업** → **CORS 활성화**
3. 다음 설정:
   - **허용된 헤더**: `*`
   - **허용된 메서드**: `*`
   - **허용된 원본**: `*`
4. **CORS 활성화 및 기존 CORS 헤더 교체** 클릭

### 방법 5: IAM 권한 확인

#### 1단계: Lambda 실행 역할 확인

1. **IAM 콘솔** → **역할**
2. `number-game-lambda-role` 선택
3. 다음 정책이 있는지 확인:
   - `AWSLambdaBasicExecutionRole`

#### 2단계: API Gateway 권한 확인

1. **Lambda 콘솔** → 함수 선택
2. **구성** → **권한** 탭
3. **리소스 기반 정책**에서 API Gateway 권한 확인

### 방법 6: 단계별 테스트

#### 1단계: 간단한 함수로 시작

```python
def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello World!'
    }
```

#### 2단계: 점진적으로 기능 추가

1. 기본 응답 → 성공
2. JSON 응답 → 성공
3. CORS 헤더 → 성공
4. 경로별 응답 → 성공
5. 실제 게임 로직 → 성공

## 🔍 디버깅 팁

### 1. 로그 확인
```bash
# CloudWatch 로그 확인
aws logs tail /aws/lambda/number-game-api --follow
```

### 2. 로컬 테스트
```bash
# Lambda 함수 로컬 테스트
python -c "
import lambda_function_simple
event = {'path': '/', 'httpMethod': 'GET'}
result = lambda_function_simple.lambda_handler(event, None)
print(result)
"
```

### 3. API Gateway 테스트
1. **API Gateway 콘솔** → API 선택
2. **테스트** 탭 클릭
3. **메서드**: GET
4. **경로**: `/`
5. **테스트** 클릭

## 📞 추가 지원

문제가 지속되면 다음 정보를 확인하세요:

1. **CloudWatch 로그** 전체 내용
2. **Lambda 함수** 설정 스크린샷
3. **API Gateway** 설정 스크린샷
4. **IAM 역할** 권한 설정
5. **테스트 요청**과 **응답**

## 🎯 예상 결과

성공적으로 설정되면:

```bash
# 헬스 체크
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/
# 응답: {"status":"healthy","message":"Number Game API is running"}

# 게임 시작
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/start
# 응답: {"message":"Start game endpoint","board":[[1,2,3],[4,5,6],[7,8,9]],"remaining_adds":999}
``` 