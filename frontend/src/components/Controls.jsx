import React from "react";
import "./Controls.css";

export default function Controls({ remaining, onAdd }) {
  return (
    <div className="controls">
      <button 
        className="add-button" 
        onClick={onAdd} 
        disabled={remaining <= 0}
      >
        Add Numbers ({remaining}번 남음!)
      </button>
    </div>
  );
} 