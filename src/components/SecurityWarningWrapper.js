'use client';

import { useState, useEffect } from 'react';
import SecurityWarning from './SecurityWarning';
import { isOfficialDomain } from '@/utils/domainCheck';

export default function SecurityWarningWrapper({ children }) {
  const [showWarning, setShowWarning] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if domain is unofficial
    if (!isOfficialDomain()) {
      setShowWarning(true);
    }
  }, []);

  const handleProceed = () => {
    setHasAccepted(true);
    setShowWarning(false);
  };

  // Don't show anything during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {showWarning && !hasAccepted && (
        <SecurityWarning onProceed={handleProceed} />
      )}
      {children}
    </>
  );
}
