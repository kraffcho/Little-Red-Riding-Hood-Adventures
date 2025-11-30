import React from "react";

interface PauseMenuProps {
  onResume: () => void;
  isVisible: boolean;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, isVisible }) => {
  const handleResume = () => {
    onResume();
  };

  return (
    <div className={`pause-menu ${isVisible ? "fade-in" : "fade-out"}`}>
      <div className={`pause-menu-content ${isVisible ? "" : "fade-out-content"}`}>
        <h2 className="pause-menu-title">Game Paused</h2>

        <div className="pause-menu-footer">
          <p className="pause-menu-instruction">Press ESC or click Resume to continue</p>
          <button className="pause-menu-resume" onClick={handleResume}>
            Resume
          </button>
        </div>

        <div className="pause-menu-scrollable">
          <div className="pause-menu-info">
            <div className="pause-menu-section">
              <h3 className="pause-menu-section-title">Controls</h3>
              <ul className="pause-menu-list">
                <li><strong>Arrow Keys</strong> or <strong>WASD</strong> to move</li>
                <li><strong>Space</strong> to use bomb</li>
                <li><strong>C</strong> to use Hunter's Cloak</li>
                <li><strong>ESC</strong> to pause/unpause</li>
                <li><strong>Swipe</strong> on mobile/tablet</li>
              </ul>
            </div>

            <div className="pause-menu-section">
              <h3 className="pause-menu-section-title">Special Items</h3>
              <ul className="pause-menu-list">
                <li>
                  <strong>💣 Bomb:</strong> Stuns wolf for 5s (3-tile radius)
                  <br />
                  <span className="pause-menu-note">5s cooldown • Wolf gets faster after each stun</span>
                </li>
                <li>
                  <strong>🧥 Hunter's Cloak:</strong> Invisible for 10s
                  <br />
                  <span className="pause-menu-note">30s cooldown • Wolf stops and gets confused</span>
                </li>
              </ul>
            </div>

            <div className="pause-menu-section">
              <h3 className="pause-menu-section-title">Objective</h3>
              <ul className="pause-menu-list">
                <li>💐 Collect all flowers</li>
                <li>🏠 Reach Granny's house</li>
                <li>🐺 Avoid the wolf!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
