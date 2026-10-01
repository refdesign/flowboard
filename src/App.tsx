import { lazy, Suspense, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';

const Board = lazy(() => import('./components/Board').then((m) => ({ default: m.Board })));

function App() {
  const { session, loading, signOut } = useAuth();
  const signedIn = Boolean(session);

  // The board is private; keep it out of search indexes. The login page stays indexable.
  useEffect(() => {
    if (!signedIn) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [signedIn]);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Suspense fallback={null}>
      <Board userEmail={session.user.email ?? ''} onSignOut={signOut} />
    </Suspense>
  );
}

export default App;
