import React, { useEffect, useState, useRef } from "react";
import { startGame, removeNumbers, addNumbers } from "./api/gameApi";
import Board from "./components/Board";
import Controls from "./components/Controls";
import soundEffects from "./utils/soundEffects";
import "./App.css";

// Simple modal popup for game instructions
function HowToPlayModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>How to Play</h2>
        <ul>
          <li>At the start, 4 of each number from 1 to 9 are randomly placed in a 4x9 board (36 numbers).</li>
          <li>You can remove two numbers if they are <b>adjacent</b> (including diagonals), or if there are no numbers between them (even across rows).</li>
          <li>The two numbers must be <b>the same</b> or <b>sum to 10</b>.</li>
          <li>You can add a new set of 36 numbers up to 5 times using the Add Numbers button.</li>
          <li>Click two numbers to try to remove them. If not removable, your selection will be cleared.</li>
        </ul>
        <button className="close-modal" onClick={onClose}>Close</button>
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
    startGame().then((data) => {
      setGame(data);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Failed to start game:", error);
      setIsLoading(false);
    });
  };

  // useEffect runs once when the component mounts (like componentDidMount)
  useEffect(() => {
    startNewGame(); // Start a new game on first load
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
          setTimeout(() => alert("Game Win! 🎉"), 800); // Delay alert to let win sound play
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
      <h1 className="game-title">Number Game</h1>
      <div className="controls-row">
        <button className="new-game-button" onClick={startNewGame}>New Game</button>
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