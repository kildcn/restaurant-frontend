import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ variant = 'info', message, dismissible = true, timeout }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Reset show state when message changes
    setShow(true);

    // Set a timeout to automatically dismiss the alert if specified
    if (timeout) {
      const timer = setTimeout(() => {
        setShow(false);
      }, timeout);

      // Clear timeout on unmount
      return () => clearTimeout(timer);
    }
  }, [message, timeout]);

  if (!message || !show) return null;

  return (
    <Alert
      variant={variant}
      onClose={() => setShow(false)}
      dismissible={dismissible}
    >
      {message}
    </Alert>
  );
};

export default AlertMessage;
