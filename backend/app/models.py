from pydantic import BaseModel
from typing import List, Optional

# GameState is a data model for the game state
# It is used to send/receive the board and remaining adds between frontend and backend
class GameState(BaseModel):
    board: List[List[Optional[int]]]  # 2D list representing the board (None means empty)
    remaining_adds: int  # How many times the player can add new numbers
    game_won: bool = False  # Whether the player has won the game 