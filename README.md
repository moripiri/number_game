# Number Game

숫자 게임 - Frontend Only 버전

## 🎮 게임 설명

합이 10이 되는 두 숫자나 같은 숫자를 선택해서 지우는 퍼즐 게임입니다.

### 게임 규칙
1. 합이 10이 되는 두 숫자나 같은 숫자를 선택해서 지울 수 있습니다
2. 두 숫자는 가로세로나 대각선으로 인접해야 합니다
3. 인접하지 않아도 두 숫자 사이에 빈 칸만 있으면 지울 수 있습니다
4. 두 숫자 사이에 줄이 바뀌어도 그 사이에 숫자가 없다면 가로로 인접합니다
5. 지울 숫자가 없다면 숫자를 추가할 수 있습니다
6. 모든 숫자를 지우면 게임이 끝납니다

## 🚀 실행 방법

### 개발 서버 실행
```bash
cd frontend
npm install
npm start
```

### 프로덕션 빌드
```bash
cd frontend
npm run build
```

## 📁 프로젝트 구조

```
number_game/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              # 메인 앱 컴포넌트
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Board.jsx        # 게임 보드
│   │   │   ├── NumberCell.jsx   # 숫자 셀
│   │   │   └── Controls.jsx     # 컨트롤 버튼
│   │   ├── api/
│   │   │   └── gameApi.js       # 게임 API (로컬 로직)
│   │   ├── utils/
│   │   │   ├── gameLogic.js     # 게임 로직
│   │   │   └── soundEffects.js  # 사운드 효과
│   │   └── App.css
│   └── package.json
└── README.md
```

## 💾 게임 상태 저장

- 게임 상태는 **LocalStorage**에 저장됩니다
- 새로고침/브라우저 종료 후에도 상태가 유지됩니다
- 여러 기기/브라우저 간 동기화는 지원하지 않습니다

## 🎵 기능

- **효과음**: 클릭, 성공, 실패, 승리 사운드
- **애니메이션**: 셀 선택, 제거, 추가 애니메이션
- **점수 시스템**: 숫자 제거 시 점수 감소
- **무제한 추가**: 숫자 추가 횟수 제한 없음

## 🌐 배포

### Vercel 배포 (권장)
```bash
cd frontend
npm run build
# Vercel CLI 또는 GitHub 연동으로 배포
```

### Netlify 배포
```bash
cd frontend
npm run build
# Netlify에 build 폴더 업로드
```

## 🔧 기술 스택

- **Frontend**: React, JavaScript
- **상태 관리**: React Hooks
- **스타일링**: CSS
- **사운드**: Web Audio API
- **저장소**: LocalStorage

## 📝 라이선스

MIT License 