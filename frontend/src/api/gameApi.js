// This file contains functions to communicate with the backend API (FastAPI)
// Each function sends a request to the backend and returns the result

const API = "http://localhost:8000"; // Backend server address (changed to avoid conflict with frontend)

// Start a new game by sending a POST request to /start
export async function startGame() {
  const res = await fetch(`${API}/start`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.json(); // Returns the initial game state
}

// Try to remove two numbers from the board
// state: the current game state (board, remaining_adds)
// pos1, pos2: [row, col] of the two cells to remove
export async function removeNumbers(state, pos1, pos2) {
  // Send pos1 and pos2 as URL parameters, and the game state as the request body
  const params = new URLSearchParams({
    pos1: JSON.stringify(pos1),
    pos2: JSON.stringify(pos2)
  });
  
  const res = await fetch(`${API}/remove?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  
  // Check if the response is successful
  if (!res.ok) {
    // Create an error object with the response for proper error handling
    const error = new Error(`HTTP error! status: ${res.status}`);
    error.response = res;
    throw error;
  }
  
  return res.json(); // Returns the updated game state
}

// Add a new set of numbers to the board (up to 5 times)
export async function addNumbers(state) {
  const res = await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  
  // Check if the response is successful
  if (!res.ok) {
    // Create an error object with the response for proper error handling
    const error = new Error(`HTTP error! status: ${res.status}`);
    error.response = res;
    throw error;
  }
  
  return res.json(); // Returns the updated game state
} 