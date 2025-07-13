// This file contains functions to communicate with the backend API (FastAPI)
// Each function sends a request to the backend and returns the result

// 백엔드 URL 설정
const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Debug: Log the API URL being used
console.log("API URL:", API);
console.log("Environment variables:", {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

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
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Response error text:", errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("Game started successfully:", data);
    return data;
  } catch (error) {
    console.error("Error starting game:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      API_URL: API
    });
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