import React from "react";

interface CreditsProps {
  variant?: "pause-menu" | "settings-menu";
}

const Credits: React.FC<CreditsProps> = ({ variant = "pause-menu" }) => {
  const className = variant === "pause-menu" ? "pause-menu-credits" : "settings-menu-credits";
  const linkClassName = variant === "pause-menu" ? "pause-menu-credits-link" : "settings-menu-credits-link";

  return (
    <div className={className}>
      <p>
        Built with ❤️ by{" "}
        <a
          href="https://www.linkedin.com/in/kraffcho/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          Kraffcho
        </a>
      </p>
    </div>
  );
};

export default Credits;

