import React, { useEffect, useState, useRef } from "react";
import { startGame, removeNumbers, addNumbers } from "./api/gameApi";
import Board from "./components/Board";
import Controls from "./components/Controls";
import soundEffects from "./utils/soundEffects";
import "./App.css";

// LocalStorage 키 상수
const GAME_STORAGE_KEY = "numberGameState";

// LocalStorage 유틸리티 함수들
const saveGameState = (gameState) => {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error("Failed to save game state to localStorage:", error);
  }
};

const loadGameState = () => {
  try {
    const savedState = localStorage.getItem(GAME_STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error("Failed to load game state from localStorage:", error);
    return null;
  }
};

const clearGameState = () => {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear game state from localStorage:", error);
  }
};

// Simple modal popup for game instructions
function HowToPlayModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>게임 방법</h2>
        <ul>
          <li> 1. 합이 10이 되는 두 숫자나 같은 숫자를 선택해서 지울 수 있습니다.</li>
          <li> 2. 두 숫자는 가로세로나 대각선으로 인접해야 합니다.</li>
          <li> 3. 단 인접하지 않아도 두 숫자 사이에 빈 칸만 있으면 지울 수 있습니다.</li>
          <li> 4. 두 숫자 사이에 줄이 바뀌어도 그 사이에 숫자가 없다면 가로로 인접합니다. </li>
          <li> 5. 지울 숫자가 없다면 숫자를 추가할 수 있습니다 (무제한) </li>
          <li> 6. 모든 숫자를 지우면 게임이 끝납니다.</li>
        </ul>
        <button className="close-modal" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

// Main React component for the Number Game
export default function App() {
  // game: stores the current game state (board, remaining adds)
  const [game, setGame] = useState(null);
  // selectedCells: stores which cells the user has currently selected
  const [selectedCells, setSelectedCells] = useState([]);
  // isLoading: true while the game is being initialized
  const [isLoading, setIsLoading] = useState(true);
  // showHowTo: controls visibility of the How to Play modal
  const [showHowTo, setShowHowTo] = useState(false);
  // animation states
  const [shakeBoard, setShakeBoard] = useState(false);
  const [removedCells, setRemovedCells] = useState([]);
  const [successCells, setSuccessCells] = useState([]);
  // 숫자 추가 애니메이션용 state
  const [newCells, setNewCells] = useState([]);
  // 이전 board 저장용 ref
  const prevBoardRef = useRef(null);
  // sound on/off state
  const [soundOn, setSoundOn] = useState(true);

  // Toggle sound
  const toggleSound = () => {
    const newSoundOn = !soundOn;
    setSoundOn(newSoundOn);
    soundEffects.setMuted(!newSoundOn);
  };

  // Function to start a new game (used for both initial load and 'New Game' button)
  const startNewGame = () => {
    // Resume audio context on first interaction
    soundEffects.resume();
    soundEffects.click();
    
    setIsLoading(true);
    setSelectedCells([]);
    clearGameState(); // 새 게임 시작 시 저장된 상태 삭제
    
    startGame().then((data) => {
      setGame(data);
      saveGameState(data); // 새 게임 상태 저장
      setIsLoading(false);
    }).catch((error) => {
      console.error("Failed to start game:", error);
      setIsLoading(false);
    });
  };

  // 게임 상태가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    if (game) {
      saveGameState(game);
    }
  }, [game]);

  // useEffect runs once when the component mounts (like componentDidMount)
  useEffect(() => {
    // 저장된 게임 상태가 있는지 확인
    const savedGame = loadGameState();
    
    if (savedGame && savedGame.board && savedGame.remaining_adds !== undefined) {
      // 저장된 게임 상태가 있으면 복원
      setGame(savedGame);
      setIsLoading(false);
    } else {
      // 저장된 게임 상태가 없으면 새 게임 시작
      startNewGame();
    }
  }, []); // empty dependency array: only run once

  // Handles when a user clicks a cell on the board
  const handleCellClick = (row, col) => {
    // Validate board and indices to prevent errors
    if (!game || !game.board || 
        row < 0 || row >= game.board.length || 
        col < 0 || col >= game.board[row].length ||
        game.board[row][col] === null) return;

    // Resume audio context on first interaction
    soundEffects.resume();

    // Create a unique key for the cell
    const cellKey = `${row},${col}`;
    // Check if this cell is already selected
    const isAlreadySelected = selectedCells.some(cell => cell.key === cellKey);

    if (isAlreadySelected) {
      // If already selected, unselect it
      soundEffects.click();
      setSelectedCells(selectedCells.filter(cell => cell.key !== cellKey));
    } else {
      // Play pop sound for selection
      soundEffects.pop();
      
      // Otherwise, add it to the selection
      const newSelected = [...selectedCells, { row, col, key: cellKey, value: game.board[row][col] }];
      
      if (newSelected.length === 2) {
        // If two cells are selected, try to remove them
        const [cell1, cell2] = newSelected;
        // Always attempt removal - let the backend handle all validation
        handleRemove([cell1.row, cell1.col], [cell2.row, cell2.col]);
        setSelectedCells([]); // Clear selection after attempt
      } else {
        setSelectedCells(newSelected);
      }
    }
  };



  // Handles the actual removal by calling the backend
  const handleRemove = (pos1, pos2) => {
    // Add fade out animation for cells being removed
    const cell1Key = `${pos1[0]},${pos1[1]}`;
    const cell2Key = `${pos2[0]},${pos2[1]}`;
    setRemovedCells([cell1Key, cell2Key]);
    
    removeNumbers(game, pos1, pos2)
      .then((data) => {
        // Play success sound and add success animation
        soundEffects.success();
        setSuccessCells([cell1Key, cell2Key]);
        setTimeout(() => setSuccessCells([]), 500);
        
        // Play remove sound
        soundEffects.remove();
        
        setGame(data); // Update the board with the new state
        // Clear removed cells animation after a short delay
        setTimeout(() => setRemovedCells([]), 300);
        // Check if game is won
        if (data.game_won) {
          // Play win sound
          soundEffects.win();
          clearGameState(); // 게임 승리 시 저장된 상태 삭제
          setTimeout(() => alert("게임 승리! 🎉"), 800); // Delay alert to let win sound play
        }
      })
      .catch(async (error) => {
        // Play error sound and trigger shake animation
        soundEffects.error();
        setShakeBoard(true);
        setTimeout(() => setShakeBoard(false), 500);
        
        setSelectedCells([]); // Only clear selection, don't change the board
        setRemovedCells([]); // Clear removed cells animation
      });
  };

  // Handles the "Add Numbers" button (adds a new set of numbers to the board)
  const handleAdd = () => {
    soundEffects.resume();
    soundEffects.click();
    addNumbers(game).then((data) => {
      // 새로 추가된 셀 위치 계산
      const prevBoard = game?.board || [];
      const nextBoard = data?.board || [];
      const newCellKeys = [];
      // 2차원 배열 비교: 새 board에서 값이 있고, prev에는 없거나 null인 위치를 찾음
      for (let i = 0; i < nextBoard.length; i++) {
        for (let j = 0; j < nextBoard[i].length; j++) {
          const prevVal = prevBoard[i]?.[j];
          const nextVal = nextBoard[i][j];
          if (nextVal !== null && (prevVal === undefined || prevVal === null)) {
            newCellKeys.push(`${i},${j}`);
          }
        }
      }
      setGame(data);
      setNewCells(newCellKeys);
      // 애니메이션 후 newCells 비움
      setTimeout(() => setNewCells([]), 700);
      // prevBoardRef 갱신
      prevBoardRef.current = nextBoard;
    }).catch(async (error) => {
      // Handle error when adding numbers - just clear selection and show feedback
      soundEffects.error();
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
    });
  };

  // Helper to check if a cell is currently selected
  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  // Show loading message while initializing
  if (isLoading) return <div className="loading">Loading...</div>;

  // Main render: title, controls row (new game left, add right), and board
  return (
    <div className="app">
      {/* Sound toggle button at top right, left of How to Play */}
      <button
        className={`sound-toggle-btn${soundOn ? "" : " sound-off"}`}
        onClick={toggleSound}
        title={soundOn ? "효과음 끄기" : "효과음 켜기"}
        aria-label={soundOn ? "효과음 끄기" : "효과음 켜기"}
      >
        {soundOn ? "🔊" : "🔇"}
      </button>
      {/* How to Play button at top right */}
      <button 
        className="howto-btn" 
        onClick={() => {
          soundEffects.resume();
          soundEffects.click();
          setShowHowTo(true);
        }} 
        title="How to Play"
      >
        ?
      </button>
      <HowToPlayModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      <h1 className="game-title">숫자 게임</h1>
      <div className="controls-row">
        <button className="new-game-button" onClick={startNewGame}>새 게임</button>
        {game && <Controls remaining={game.remaining_adds} onAdd={handleAdd} />}
      </div>
      <Board 
        board={game?.board || []} 
        onCellClick={handleCellClick}
        selectedCells={selectedCells}
        isCellSelected={isCellSelected}
        shakeBoard={shakeBoard}
        removedCells={removedCells}
        successCells={successCells}
        newCells={newCells}
      />
    </div>
  );
} 