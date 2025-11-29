import React from "react";

interface VolumeIconProps {
  className?: string;
  muted?: boolean;
}

const VolumeIcon: React.FC<VolumeIconProps> = ({ className, muted = false }) => {
  if (muted) {
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
        {/* muted volume icon */}
        <path
          d="M8 6L5 9H2V11H5L8 14V6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M13 8L16 11L13 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 5C12.5 6 13.5 8.5 13.5 11C13.5 13.5 12.5 16 11 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

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
      {/* normal volume icon */}
      <path
        d="M8 6L5 9H2V11H5L8 14V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11 5C12.5 6 13.5 8.5 13.5 11C13.5 13.5 12.5 16 11 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VolumeIcon;

