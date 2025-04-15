import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size, variant = 'primary', centered = false }) => {
  const spinner = (
    <Spinner
      animation="border"
      role="status"
      variant={variant}
      size={size}
    >
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );

  if (centered) {
    return (
      <div className="d-flex justify-content-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
