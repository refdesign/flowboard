import { useAuth } from './hooks/useAuth';
import { Board } from './components/Board';
import { Login } from './components/Login';

function App() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Login />;
  }

  return <Board userEmail={session.user.email ?? ''} onSignOut={signOut} />;
}

export default App;
