import React from "react";
import { getLevelConfig } from "../constants/levelConfig";
import Credits from "./ui/Credits";

interface PauseMenuProps {
  onResume: () => void;
  isVisible: boolean;
  currentLevel: number;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, isVisible, currentLevel }) => {
  const levelConfig = getLevelConfig(currentLevel);

  // format milliseconds to seconds for display (round to avoid decimals)
  const formatSeconds = (ms: number) => Math.round(ms / 1000);

  const bombStunSeconds = formatSeconds(levelConfig.bombStunDuration);
  const bombCooldownSeconds = formatSeconds(levelConfig.bombCooldown);
  const cloakInvisibilitySeconds = formatSeconds(levelConfig.cloakInvisibilityDuration);
  const cloakCooldownSeconds = formatSeconds(levelConfig.cloakCooldown);
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

        <div className="pause-menu-scrollable-wrapper">
          <div className="pause-menu-scrollable">
            <div className="pause-menu-info">
              <div className="pause-menu-section">
                <h3 className="pause-menu-section-title">Controls</h3>
                <ul className="pause-menu-list">
                  <li><strong>Arrow Keys</strong> or <strong>WASD</strong> to move</li>
                  {levelConfig.bombUnlocked && (
                    <li><strong>Space</strong> to use bomb</li>
                  )}
                  {levelConfig.cloakUnlocked && (
                    <li><strong>C</strong> to use Hunter's Cloak</li>
                  )}
                  <li><strong>ESC</strong> to pause/unpause</li>
                  <li><strong>Swipe</strong> on mobile/tablet</li>
                </ul>
              </div>

              <div className="pause-menu-section">
                <h3 className="pause-menu-section-title">Special Items</h3>
                <ul className="pause-menu-list">
                  {levelConfig.bombUnlocked && (
                    <li>
                      <strong>💣 Bomb:</strong> Stuns wolf for {bombStunSeconds}s (3-tile radius)
                      <br />
                      <span className="pause-menu-note">{bombCooldownSeconds}s cooldown • Wolf gets faster after each stun</span>
                    </li>
                  )}
                  {levelConfig.cloakUnlocked && (
                    <li>
                      <strong>🧥 Hunter's Cloak:</strong> Invisible for {cloakInvisibilitySeconds}s
                      <br />
                      <span className="pause-menu-note">{cloakCooldownSeconds}s cooldown • Wolf stops and gets confused</span>
                    </li>
                  )}
                  {!levelConfig.bombUnlocked && !levelConfig.cloakUnlocked && (
                    <li>
                      <span className="pause-menu-note">No special items available in this level</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="pause-menu-section">
                <h3 className="pause-menu-section-title">Objective</h3>
                <ul className="pause-menu-list">
                  <li>💐 Collect all {levelConfig.numFlowers} flowers</li>
                  <li>🏠 Reach Granny's house</li>
                  <li>🐺 Avoid the wolf!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Credits variant="pause-menu" />
      </div>
    </div>
  );
};

export default PauseMenu;
