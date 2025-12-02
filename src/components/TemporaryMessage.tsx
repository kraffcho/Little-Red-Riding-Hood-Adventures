import React, { useEffect, useState } from 'react';

interface TemporaryMessageProps {
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onComplete?: () => void;
}

const TemporaryMessage: React.FC<TemporaryMessageProps> = ({
  message,
  type = 'success',
  duration = 2000,
  onComplete
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`temporary-message-overlay ${type}`}>
      <div className="temporary-message-content">
        <div className={`temporary-message-text ${type}`}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default TemporaryMessage;

