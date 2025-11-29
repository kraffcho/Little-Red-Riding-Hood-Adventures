import React from "react";

interface RestartIconProps {
  className?: string;
}

const RestartIcon: React.FC<RestartIconProps> = ({ className }) => {
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
      <path
        d="M3 10C3 6.13 6.13 3 10 3C12.5 3 14.65 4.2 16 6.07M17 10C17 13.87 13.87 17 10 17C7.5 17 5.35 15.8 4 13.93"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L3 3V6H6Z"
        fill="currentColor"
      />
      <path
        d="M14 14L17 17V14H14Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default RestartIcon;

