from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .models import GameState
from .game_logic import create_initial_board, create_board_from_remaining, can_remove, remove_numbers, is_game_won
from typing import Tuple
import json

# Create the FastAPI app (the backend server)
app = FastAPI()

# Allow requests from the frontend (React running on localhost:3000 and deployed domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "https://*.vercel.app",   # Vercel deployed domains
        "https://*.netlify.app",  # Netlify deployed domains
        "https://*.github.io",    # GitHub Pages deployed domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint to start a new game
@app.post("/start")
def start_game():
    board = create_initial_board()  # Generate a new random board
    state = GameState(board=board, remaining_adds=5)  # 5 adds allowed
    return state  # Return the initial game state as JSON

# Endpoint to try to remove two numbers from the board
# Receives the current game state (as JSON body) and pos1, pos2 as URL parameters
@app.post("/remove")
def remove(
    state: GameState, 
    pos1: str = Query(..., description="Position 1 as JSON string"),
    pos2: str = Query(..., description="Position 2 as JSON string")
):
    try:
        pos1_tuple = tuple(json.loads(pos1))  # Convert JSON string to tuple
        pos2_tuple = tuple(json.loads(pos2))
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(400, "Invalid position format")
    
    # Check if the removal is allowed by the game rules
    if not can_remove(state.board, pos1_tuple, pos2_tuple):
        raise HTTPException(400, "Cannot remove: Numbers must be adjacent or have a clear path")
    # Remove the numbers and return the new game state
    state.board = remove_numbers(state.board, pos1_tuple, pos2_tuple)
    
    # Check if game is won after removal
    if is_game_won(state.board):
        state.game_won = True
    
    return state

def get_last_number_index(row):
    for i in range(len(row) - 1, -1, -1):  # 뒤에서부터 검사
        if row[i] is not None:
            return i
    return -1  # 숫자가 없으면 -1

# Endpoint to add remaining numbers from the current board (up to 5 times)
@app.post("/add")
def add_numbers(state: GameState):
    if state.remaining_adds <= 0:
        raise HTTPException(400, "No adds left")
    
    # Create new board using remaining numbers from current board
    new_board = create_board_from_remaining(state.board)
    
    if new_board and new_board[0]:  # If there are remaining numbers
        remaining_numbers = new_board[0]  # Get the single row of remaining numbers
        
        # Start with the last row if it exists, otherwise create a new row
        current_row = len(state.board) - 1 if state.board else -1
        
        for number in remaining_numbers:
            # If we need a new row (no rows exist or current row is full)
            if current_row < 0 or (get_last_number_index(state.board[current_row]) + 1) >= 9:
                state.board.append([])
                current_row = len(state.board) - 1
            
            # Find the next position after the last number in current row
            last_num_index = get_last_number_index(state.board[current_row])
            next_position = last_num_index + 1
            
            # Add the number at the next position
            if next_position < len(state.board[current_row]):
                state.board[current_row][next_position] = number
            else:
                state.board[current_row].append(number)
    
    # Ensure the last row has exactly 9 cells by padding with None
    if state.board and len(state.board) > 0:
        last_row = state.board[-1]
        while len(last_row) < 9:
            last_row.append(None)
    
    state.remaining_adds -= 1
    return state 