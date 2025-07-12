# 무료 호스팅 배포 가이드

이 가이드는 숫자 게임을 무료로 인터넷에 배포하는 방법을 설명합니다.

## 추천 방법: Vercel + Railway

### 1. 백엔드 배포 (Railway)

1. **Railway 계정 생성**
   - https://railway.app 에서 GitHub 계정으로 로그인

2. **프로젝트 생성**
   - "New Project" → "Deploy from GitHub repo"
   - 이 저장소를 선택

3. **환경 설정**
   - Railway가 자동으로 Python 프로젝트를 인식
   - `backend/` 폴더를 루트로 설정

4. **배포 확인**
   - 배포가 완료되면 Railway에서 제공하는 URL을 복사 (예: `https://your-app.railway.app`)

### 2. 프론트엔드 배포 (Vercel)

1. **Vercel 계정 생성**
   - https://vercel.com 에서 GitHub 계정으로 로그인

2. **프로젝트 생성**
   - "New Project" → 이 저장소 선택
   - Framework Preset: "Create React App" 선택
   - Root Directory: `frontend` 선택

3. **환경변수 설정**
   - Project Settings → Environment Variables
   - `REACT_APP_API_URL` = 백엔드 URL (Railway에서 받은 URL)

4. **배포 확인**
   - 배포가 완료되면 Vercel에서 제공하는 URL로 접속

## 대안 방법들

### Netlify + Render
- **Netlify**: 프론트엔드 배포 (https://netlify.com)
- **Render**: 백엔드 배포 (https://render.com)

### GitHub Pages + Heroku
- **GitHub Pages**: 프론트엔드 배포 (무료)
- **Heroku**: 백엔드 배포 (무료 티어 종료됨)

## 로컬 테스트

배포 전에 로컬에서 테스트하려면:

```bash
# 백엔드 실행
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm start
```

## 문제 해결

1. **CORS 오류**: 백엔드의 `allow_origins`에 프론트엔드 도메인 추가
2. **API 연결 실패**: 환경변수 `REACT_APP_API_URL` 확인
3. **빌드 실패**: `npm install` 후 `npm run build` 테스트

## 비용

- **Vercel**: 무료 (월 100GB 대역폭)
- **Railway**: 무료 (월 $5 크레딧, 보통 무료로 충분)
- **Netlify**: 무료 (월 100GB 대역폭)
- **Render**: 무료 (월 750시간) 