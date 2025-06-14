import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-container">
      <div className={`toast-content ${type}`}>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          animation: slideIn 0.3s ease-out forwards;
        }
        .toast-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          max-width: 450px;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: white;
        }
        .toast-content.success {
          background-color: #4caf50;
        }
        .toast-content.error {
          background-color: #f44336;
        }
        .toast-message {
          font-size: 16px;
          margin-right: 12px;
        }
        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.8;
          padding: 0;
          height: 24px;
          width: 24px;
          line-height: 1;
          transition: opacity 0.2s;
        }
        .toast-close:hover {
          opacity: 1;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;