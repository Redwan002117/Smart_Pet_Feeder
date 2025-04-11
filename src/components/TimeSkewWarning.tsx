import React, { useState } from 'react';
import '../styles/TimeSkewWarning.css';

interface TimeSkewWarningProps {
  skewSeconds: number;
  onDismiss: () => void;
  localTime?: number;
  serverTime?: number;
}

const TimeSkewWarning: React.FC<TimeSkewWarningProps> = ({ 
  skewSeconds, 
  onDismiss,
  localTime,
  serverTime
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Convert unix timestamps to readable date strings if available
  const localTimeString = localTime 
    ? new Date(localTime * 1000).toLocaleString() 
    : 'Unknown';
  
  const serverTimeString = serverTime 
    ? new Date(serverTime * 1000).toLocaleString() 
    : 'Unknown';
  
  const minutes = Math.floor(skewSeconds / 60);
  const hours = Math.floor(minutes / 60);
  
  let timeDisplay = '';
  if (hours > 0) {
    timeDisplay = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    timeDisplay = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    timeDisplay = `${skewSeconds} second${skewSeconds !== 1 ? 's' : ''}`;
  }

  return (
    <div className="time-skew-warning">
      <div className="warning-content">
        <div className="warning-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="warning-details">
          <h3>System Clock Warning</h3>
          <p>Your device clock appears to be off by approximately {timeDisplay}. This may cause authentication issues.</p>
          
          {isExpanded && (
            <div className="time-details">
              <p><strong>Your device time:</strong> {localTimeString}</p>
              <p><strong>Server time:</strong> {serverTimeString}</p>
              <p>
                Please adjust your system time to ensure proper functionality. Most operating systems can be configured to 
                synchronize time automatically.
              </p>
            </div>
          )}
          
        </div>
        <div className="warning-actions">
          <button 
            className="btn-fix"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
          <button 
            className="btn-dismiss" 
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSkewWarning;
