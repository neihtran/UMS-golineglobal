import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { useAuthStore } from './stores/authStore';
import './styles/globals.css';
import './locales'; // i18n setup

// Sync auth state on app mount (handles localStorage rehydration)
function useAuthSync() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
}

function AppWithAuthSync() {
  useAuthSync();
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithAuthSync />
  </React.StrictMode>,
);
