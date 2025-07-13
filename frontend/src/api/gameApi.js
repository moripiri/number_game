// This file contains functions to communicate with the backend API (FastAPI)
// Each function sends a request to the backend and returns the result

// 임시로 Railway URL을 직접 설정 (환경변수 설정 후 제거)
const API = process.env.REACT_APP_API_URL || "https://your-railway-app.railway.app"; // Backend server address

// Debug: Log the API URL being used
console.log("API URL:", API);

// Start a new game by sending a POST request to /start
export async function startGame() {
  console.log("Starting game, calling:", `${API}/start`);
  try {
    const res = await fetch(`${API}/start`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    console.log("Response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log("Game started successfully:", data);
    return data;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
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