import React from "react";
import NumberCell from "./NumberCell";
import "./Board.css";

export default function Board({ board, onCellClick, selectedCells, isCellSelected, shakeBoard, removedCells, successCells, newCells = [] }) {
  // board가 없거나 비어있으면 로딩 표시
  if (!board || !Array.isArray(board) || board.length === 0) {
    return (
      <div className="board-container">
        <div className="loading">Loading board...</div>
      </div>
    );
  }

  // Combine shake animation class
  const boardClass = `board-container ${shakeBoard ? 'shake' : ''}`;

  return (
    <div className={boardClass}>
      <table className="game-board">
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((num, j) => {
                const cellKey = `${i},${j}`;
                const isRemoved = removedCells.includes(cellKey);
                const isSuccess = successCells.includes(cellKey);
                const isNew = newCells.includes(cellKey);
                return (
                  <NumberCell 
                    key={j} 
                    value={num} 
                    row={i} 
                    col={j}
                    onClick={onCellClick}
                    isSelected={isCellSelected(i, j)}
                    isRemoved={isRemoved}
                    isSuccess={isSuccess}
                    isNew={isNew}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 