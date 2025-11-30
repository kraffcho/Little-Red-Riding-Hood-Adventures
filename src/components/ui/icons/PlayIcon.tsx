import React from "react";

interface PlayIconProps {
  className?: string;
}

const PlayIcon: React.FC<PlayIconProps> = ({ className }) => {
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
      {/* play icon - triangle pointing right */}
      <path
        d="M7 5L15 10L7 15V5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PlayIcon;
