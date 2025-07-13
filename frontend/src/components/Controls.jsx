import React from "react";
import "./Controls.css";

export default function Controls({ remaining, onAdd }) {
  return (
    <div className="controls">
      <button 
        className="add-button" 
        onClick={onAdd} 
      >
        숫자 추가
      </button>
    </div>
  );
} 