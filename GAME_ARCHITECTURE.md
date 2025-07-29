# Number Game: React + FastAPI로 만든 퍼즐 게임 아키텍처 분석

## 🎮 프로젝트 개요

Number Game은 합이 10이 되는 숫자들을 매칭하여 제거하는 퍼즐 게임입니다. React 프론트엔드와 FastAPI 백엔드로 구성된 풀스택 웹 애플리케이션으로, LocalStorage를 활용한 상태 관리와 다양한 애니메이션 효과를 특징으로 합니다.

## 🏗️ 전체 아키텍처

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   React Frontend │ ◄────────────► │  FastAPI Backend │
│                 │                │                 │
│ • Game UI       │                │ • Game Logic    │
│ • State Mgmt    │                │ • Board Creation │
│ • Animations    │                │ • Validation    │
│ • LocalStorage  │                │ • Stateless     │
└─────────────────┘                └─────────────────┘
```

## 📁 프로젝트 구조

```
number_game/
├── frontend/                 # React 애플리케이션
│   ├── src/
│   │   ├── App.jsx          # 메인 컴포넌트
│   │   ├── components/      # UI 컴포넌트들
│   │   │   ├── Board.jsx    # 게임 보드
│   │   │   ├── NumberCell.jsx # 개별 숫자 셀
│   │   │   └── Controls.jsx # 게임 컨트롤
│   │   ├── api/
│   │   │   └── gameApi.js   # API 통신
│   │   └── utils/
│   │       └── soundEffects.js # 사운드 효과
│   └── package.json
├── backend/                  # FastAPI 서버
│   ├── app/
│   │   ├── main.py          # API 엔드포인트
│   │   ├── game_logic.py    # 게임 규칙 로직
│   │   └── models.py        # 데이터 모델
│   └── requirements.txt
└── README.md
```

## 🎯 핵심 기술 스택

### Frontend
- **React 18.2.0**: 컴포넌트 기반 UI
- **CSS**: 스타일링 및 애니메이션
- **LocalStorage**: 게임 상태 영속성

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Pydantic**: 데이터 검증 및 직렬화
- **Uvicorn**: ASGI 서버

## 🔧 핵심 기능 분석

### 1. 게임 로직 (Backend)

#### 보드 생성 알고리즘
```python
def create_initial_board() -> List[List[Optional[int]]]:
    # 1-9까지 각 숫자를 최소 2번씩 보장
    numbers = [i for i in range(1, 10)] * 2
    
    # 나머지 17개 숫자를 랜덤으로 추가
    remaining_numbers = [random.randint(1, 9) for _ in range(17)]
    numbers.extend(remaining_numbers)
    
    # 3행 9열 + 1행 8열 구조로 배치
    board = []
    for i in range(3):
        board.append(numbers[i*9:(i+1)*9])
    board.append(numbers[27:35])
    return board
```

#### 매칭 검증 로직
```python
def can_remove(board, pos1, pos2) -> bool:
    # 1. 같은 숫자이거나 합이 10인지 확인
    if num1 != num2 and num1 + num2 != 10:
        return False
    
    # 2. 인접하거나 경로가 막히지 않았는지 확인
    return is_adjacent_or_clear_path(board, pos1, pos2)
```

### 2. 상태 관리 (Frontend)

#### LocalStorage 기반 영속성
```javascript
const saveGameState = (gameState) => {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
};

const loadGameState = () => {
  const savedState = localStorage.getItem(GAME_STORAGE_KEY);
  return savedState ? JSON.parse(savedState) : null;
};
```

#### 컴포넌트 상태 관리
```javascript
const [game, setGame] = useState(null);           // 게임 상태
const [selectedCells, setSelectedCells] = useState([]); // 선택된 셀들
const [isLoading, setIsLoading] = useState(true); // 로딩 상태
const [soundOn, setSoundOn] = useState(true);     // 사운드 설정
```

### 3. 애니메이션 시스템

#### CSS 애니메이션 클래스
```css
.shake { animation: shake 0.5s; }
.fade-out { animation: fadeOut 0.3s; }
.success { animation: success 0.5s; }
.new-cell { animation: newCell 0.5s; }
```

#### 애니메이션 상태 관리
```javascript
const [shakeBoard, setShakeBoard] = useState(false);
const [removedCells, setRemovedCells] = useState([]);
const [successCells, setSuccessCells] = useState([]);
const [newCells, setNewCells] = useState([]);
```

### 4. 사운드 시스템

#### Web Audio API 활용
```javascript
class SoundEffects {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
  }
  
  click() { /* 클릭 사운드 */ }
  pop() { /* 팝 사운드 */ }
  success() { /* 성공 사운드 */ }
  error() { /* 에러 사운드 */ }
  win() { /* 승리 사운드 */ }
}
```

## 🔄 데이터 플로우

### 1. 게임 시작
```
1. React App 마운트
2. LocalStorage에서 저장된 상태 확인
3. 저장된 상태가 있으면 복원, 없으면 새 게임 시작
4. FastAPI /start 엔드포인트 호출
5. 초기 보드 생성 및 반환
6. 게임 상태를 LocalStorage에 저장
```

### 2. 숫자 제거
```
1. 사용자가 두 셀 선택
2. 선택된 셀들의 유효성 검사
3. FastAPI /remove 엔드포인트 호출
4. 백엔드에서 매칭 규칙 검증
5. 성공 시 보드 업데이트, 실패 시 에러 애니메이션
6. 업데이트된 상태를 LocalStorage에 저장
```

### 3. 숫자 추가
```
1. 사용자가 "Add Numbers" 버튼 클릭
2. FastAPI /add 엔드포인트 호출
3. 백엔드에서 새로운 숫자들 생성
4. 보드에 새 숫자들 추가
5. 애니메이션 효과와 함께 UI 업데이트
```

## 🎨 UI/UX 설계

### 컴포넌트 계층 구조
```
App
├── Board
│   └── NumberCell (여러 개)
├── Controls
└── HowToPlayModal
```

### 반응형 디자인
- CSS Grid를 활용한 유연한 보드 레이아웃
- 모바일 친화적인 터치 인터페이스
- 다양한 화면 크기에 대응하는 반응형 디자인

### 접근성 고려사항
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 및 가독성 최적화

## 🚀 성능 최적화

### 1. 메모리 관리
- 불필요한 리렌더링 방지를 위한 React.memo 활용
- 애니메이션 상태의 적절한 정리
- LocalStorage 사용량 최적화

### 2. 네트워크 최적화
- Stateless 백엔드 설계로 서버 리소스 절약
- 필요한 데이터만 전송하는 효율적인 API 설계
- 에러 처리 및 재시도 로직

### 3. 사용자 경험
- 로딩 상태 표시
- 즉각적인 피드백 (애니메이션, 사운드)
- 게임 상태 자동 저장

## 🔒 보안 고려사항

### 1. 입력 검증
- 프론트엔드와 백엔드 양쪽에서 유효성 검사
- XSS 공격 방지를 위한 데이터 이스케이핑
- API 요청의 적절한 검증

### 2. 데이터 보호
- 민감한 정보는 서버에 저장하지 않음
- LocalStorage 사용 시 데이터 무결성 확인
- 클라이언트 사이드 보안 고려사항

## 📊 확장 가능성

### 1. 기능 확장
- 멀티플레이어 지원
- 리더보드 시스템
- 다양한 게임 모드
- 난이도 조절

### 2. 기술적 확장
- WebSocket을 통한 실시간 기능
- PWA(Progressive Web App) 지원
- 오프라인 플레이 기능
- 데이터베이스 연동

## 🎯 개발 철학

### 1. 단순함 (Simplicity)
- 복잡한 상태 관리 라이브러리 대신 React 기본 기능 활용
- 명확하고 이해하기 쉬운 코드 구조
- 최소한의 의존성

### 2. 사용자 중심 (User-Centric)
- 직관적인 게임 인터페이스
- 즉각적인 피드백과 애니메이션
- 게임 상태의 자동 저장

### 3. 성능 최적화 (Performance)
- 효율적인 렌더링
- 최적화된 애니메이션
- 빠른 응답 시간

## 📝 결론

Number Game은 현대적인 웹 개발 기술을 활용하여 만든 완성도 높은 퍼즐 게임입니다. React와 FastAPI의 조합으로 성능과 개발 경험을 모두 만족시키는 아키텍처를 구축했으며, LocalStorage를 활용한 상태 관리와 다양한 애니메이션 효과로 사용자에게 매력적인 게임 경험을 제공합니다.

이 프로젝트는 작은 규모이지만 확장 가능한 구조를 가지고 있어, 향후 다양한 기능 추가나 개선이 용이한 설계를 보여줍니다.

---

*이 글은 Number Game 프로젝트의 기술적 구조와 설계 철학을 분석한 내용입니다. 실제 코드와 더 자세한 구현 세부사항은 프로젝트 저장소를 참조하시기 바랍니다.* 