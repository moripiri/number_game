# Number Game

## 프로젝트 구조

```
number_game/
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI 진입점 (상태 저장 X)
│   │   ├── game_logic.py      # 게임 규칙/로직
│   │   └── models.py          # 데이터 모델
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Board.jsx
│   │   │   ├── NumberCell.jsx
│   │   │   └── Controls.jsx
│   │   └── api/
│   │       └── gameApi.js
│   └── package.json
│
└── README.md
```

## 실행 방법

### 1. 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

## 게임 상태 저장 방식
- 게임 상태는 **LocalStorage**에만 저장됩니다.
- 새로고침/브라우저 종료 후에도 상태가 유지됩니다.
- 여러 기기/브라우저 간 동기화는 지원하지 않습니다.
- 서버는 stateless(상태 저장 X)로 동작합니다. 