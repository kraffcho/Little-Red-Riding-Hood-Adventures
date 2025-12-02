import React from "react";

interface SettingsIconProps {
  className?: string;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({ className }) => {
  const centerX = 10;
  const centerY = 10;
  const innerRadius = 4;
  const outerRadius = 8;
  const teeth = 12;
  const toothDepth = 1.5;

  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i * Math.PI) / teeth - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  points.push('Z');

  const gearPath = points.join(' ');

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
        d={gearPath}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export default SettingsIcon;
