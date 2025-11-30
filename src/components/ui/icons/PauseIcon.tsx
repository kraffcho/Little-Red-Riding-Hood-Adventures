import React from "react";

interface PauseIconProps {
  className?: string;
}

const PauseIcon: React.FC<PauseIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* two vertical bars for pause icon */}
      <rect x="6" y="4" width="2.5" height="12" rx="1" fill="currentColor" />
      <rect x="11.5" y="4" width="2.5" height="12" rx="1" fill="currentColor" />
    </svg>
  );
};

export default PauseIcon;
