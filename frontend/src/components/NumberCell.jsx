import React from "react";

export default function NumberCell({ value, row, col, onClick, isSelected, isRemoved, isSuccess, isNew }) {
  const handleClick = () => {
    if (value !== null && onClick) {
      onClick(row, col);
    }
  };

  // Build className with animations
  let className = "";
  if (isSelected) className += "selected ";
  if (isRemoved) className += "fade-out ";
  if (isSuccess) className += "success-flash ";
  if (isNew) className += "cell--new ";
  if (isSelected && !isRemoved && !isSuccess) className += "pulse ";

  return (
    <td 
      onClick={handleClick}
      className={className.trim()}
    >
      {value !== null ? value : ""}
    </td>
  );
} 