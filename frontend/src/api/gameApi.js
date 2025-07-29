// Frontend game API - uses local game logic instead of backend
// This replaces the need for a backend server

import { startGame as startGameLogic, removeNumbers as removeNumbersLogic, addNumbers as addNumbersLogic, canRemove } from '../utils/gameLogic';

// Start a new game using local logic
export async function startGame() {
  console.log("Starting game with local logic");
  try {
    const data = startGameLogic();
    console.log("Game started successfully:", data);
    return data;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
}

// Try to remove two numbers from the board using local logic
// state: the current game state (board, remaining_adds)
// pos1, pos2: [row, col] of the two cells to remove
export async function removeNumbers(state, pos1, pos2) {
  try {
    // Check if the removal is valid
    if (!canRemove(state.board, pos1, pos2)) {
      const error = new Error("Invalid move");
      error.response = { status: 400 };
      throw error;
    }
    
    // Remove the numbers
    const newBoard = removeNumbersLogic(state.board, pos1, pos2);
    
    // Check if game is won
    const gameWon = newBoard.length === 0;
    
    return {
      board: newBoard,
      remaining_adds: state.remaining_adds,
      game_won: gameWon
    };
  } catch (error) {
    console.error("Error removing numbers:", error);
    throw error;
  }
}

// Add a new set of numbers to the board using local logic
export async function addNumbers(state) {
  try {
    const result = addNumbersLogic(state.board, state.remaining_adds);
    return result;
  } catch (error) {
    console.error("Error adding numbers:", error);
    throw error;
  }
} 