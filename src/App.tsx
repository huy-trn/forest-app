import { useState } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';

export type UserRole = 'admin' | 'farmer' | 'buyer' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (role: UserRole, email: string, name: string) => {
    setCurrentUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone: '+84 123 456 789',
      role
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'admin' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'farmer' && (
        <FarmerDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'buyer' && (
        <BuyerDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
