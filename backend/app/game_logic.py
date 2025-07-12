import random
from typing import List, Optional, Tuple

# Create the initial game board: 3 rows of 9 numbers + 1 row of 8 numbers (35 total)
# Each number 1-9 appears at least 2 times, remaining 17 numbers distributed freely
def create_initial_board() -> List[List[Optional[int]]]:
    # First, ensure each number 1-9 appears at least 2 times (18 numbers total)
    numbers = [i for i in range(1, 10)] * 2  # 1-9, two times each
    
    # Add 17 more random numbers (1-9) to make total 35
    remaining_numbers = [random.randint(1, 9) for _ in range(17)]
    numbers.extend(remaining_numbers)
    
    # Shuffle all numbers
    random.shuffle(numbers)
    
    # Create the board: 3 rows of 9 + 1 row of 8
    board = []
    for i in range(3):
        board.append(numbers[i*9:(i+1)*9])  # First 3 rows: 9 numbers each
    board.append(numbers[27:35])  # Last row: 8 numbers
    return board

# Collect all remaining numbers from the board (excluding None/empty cells)
def collect_remaining_numbers(board: List[List[Optional[int]]]) -> List[int]:
    remaining = []
    for row in board:
        for cell in row:
            if cell is not None:
                remaining.append(cell)
    return remaining

# Create a new board using only the remaining numbers from the current board
# Returns the remaining numbers in their original order (no shuffle)
def create_board_from_remaining(board: List[List[Optional[int]]]) -> List[List[Optional[int]]]:
    # Collect all remaining numbers
    remaining_numbers = collect_remaining_numbers(board)
    
    # If no numbers left, return empty board
    if not remaining_numbers:
        return []
    
    # Return the remaining numbers as a single row (maintaining original order)
    return [remaining_numbers]  # type: ignore

# Check if two positions can be removed according to the game rules
# Rules:
# - The numbers must be the same or sum to 10
# - The positions must be adjacent, or all cells between them must be empty (None)
def can_remove(board: List[List[Optional[int]]], pos1: Tuple[int, int], pos2: Tuple[int, int]) -> bool:
    r1, c1 = pos1
    r2, c2 = pos2

    # Can't remove the same cell
    if r1 == r2 and c1 == c2:
        return False
    # Both positions must have a number
    if board[r1][c1] is None or board[r2][c2] is None:
        return False
        
    # Must be same number or sum to 10
    num1, num2 = board[r1][c1], board[r2][c2]
    # At this point, num1 and num2 are guaranteed to be int (not None) due to the check above
    if num1 != num2 and num1 + num2 != 10:  # type: ignore
        return False

    # Must be adjacent or have a clear path (no numbers in between)
    return is_adjacent_or_clear_path(board, pos1, pos2)

# Check if two positions are adjacent or have a clear path (no numbers in between)
def is_adjacent_or_clear_path(board: List[List[Optional[int]]], pos1: Tuple[int, int], pos2: Tuple[int, int]) -> bool:
    r1, c1 = pos1
    r2, c2 = pos2
    
    # Adjacent (including diagonals)
    if abs(r1 - r2) <= 1 and abs(c1 - c2) <= 1:
        return True
    
    # Same row: check all cells between
    if r1 == r2:
        start_col, end_col = min(c1, c2), max(c1, c2)
        for col in range(start_col + 1, end_col):
            if col < len(board[r1]) and board[r1][col] is not None:
                return False
        return True
    
    # Same column: check all cells between
    if c1 == c2:
        start_row, end_row = min(r1, r2), max(r1, r2)
        for row in range(start_row + 1, end_row):
            if row < len(board) and c1 < len(board[row]) and board[row][c1] is not None:
                return False
        return True
    
    # Diagonal: check all cells between
    if abs(r1 - r2) == abs(c1 - c2):
        return is_diagonal_path_clear(board, pos1, pos2)
    
    # For non-adjacent, non-same-row/column, non-diagonal positions:
    # Check if there's a clear path by checking if all cells in the rows between them are None
    
    start_row, end_row = min(r1, r2), max(r1, r2)
    
    for row in range(start_row, end_row + 1):
        # Check all columns in this row
        for col in range(9):
            if row == start_row and col < c1:
                continue
            # Skip the two positions we're checking
            if (row == r1 and col == c1):
                continue
            if (row == r2 and col == c2):
                break
            # Check if cell is not None
            if board[row][col] is not None:
                return False
    
    return True

# Check if the diagonal path between two positions is clear (no numbers in between)
def is_diagonal_path_clear(board: List[List[Optional[int]]], pos1: Tuple[int, int], pos2: Tuple[int, int]) -> bool:
    r1, c1 = pos1
    r2, c2 = pos2
    # Determine the direction of the diagonal
    row_step = 1 if r2 > r1 else -1
    col_step = 1 if c2 > c1 else -1
    current_row, current_col = r1 + row_step, c1 + col_step
    # Move along the diagonal and check each cell
    while current_row != r2 and current_col != c2:
        # Check if the cell exists and is not None
        if (current_row < len(board) and 
            current_col < len(board[current_row]) and 
            board[current_row][current_col] is not None):
            return False
        current_row += row_step
        current_col += col_step
    return True

# Remove two numbers from the board (set them to None) and clean up empty rows
def remove_numbers(board: List[List[Optional[int]]], pos1: Tuple[int, int], pos2: Tuple[int, int]) -> List[List[Optional[int]]]:
    r1, c1 = pos1
    r2, c2 = pos2
    # Make a copy of the board
    new_board = [row[:] for row in board]
    # Set the two positions to None (removed)
    new_board[r1][c1] = None
    new_board[r2][c2] = None
    # Clean up empty rows (remove rows that are completely empty)
    new_board = clean_empty_rows(new_board)
    return new_board

# Remove rows that are completely empty (all cells are None)
def clean_empty_rows(board: List[List[Optional[int]]]) -> List[List[Optional[int]]]:
    # Keep only rows that have at least one non-None cell
    cleaned_board = [row for row in board if any(cell is not None for cell in row)]
    return cleaned_board

# Check if the game is won (board is completely empty)
def is_game_won(board: List[List[Optional[int]]]) -> bool:
    # Since clean_empty_rows removes all empty rows,
    # if board is empty, all numbers have been removed
    return not board 