import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { ServerErrorPage } from '../pages/ServerErrorPage';
import { ErrorBoundary } from './ErrorBoundary';

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const { key } = useLocation();
  return (
    <ErrorBoundary resetKey={key} fallback={(retry) => <ServerErrorPage onRetry={retry} />}>
      {children}
    </ErrorBoundary>
  );
}
