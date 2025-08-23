import React from 'react';

/**
 * Loading Component
 * Reusable loading indicator following Single Responsibility Principle
 */

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`loading-container ${size} ${className}`} role=\"status\" aria-live=\"polite\">
      <div className=\"loading-spinner\">
        <div className=\"spinner-ring\"></div>
        <div className=\"spinner-ring\"></div>
        <div className=\"spinner-ring\"></div>
        <div className=\"spinner-ring\"></div>
      </div>
      <span className=\"loading-message\">{message}</span>
      <span className=\"sr-only\">Loading content, please wait...</span>
    </div>
  );
};

export default Loading;