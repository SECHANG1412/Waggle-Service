import React, { useState } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './Components/Navbar';
import LoginModal from './Components/Modal/LoginModal';
import { AuthProvider, useAuth } from './hooks/useAuth';
import SignupModal from './Components/Modal/SignupModal';
import Footer from './Components/Footer/Footer';
import Main from './Pages/Main';
import CreateTopic from './Pages/CreateTopic';
import Swal from 'sweetalert2';
import SingleTopic from './Pages/SingleTopic';
import Profile from './Pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: '로그인 필요',
      text: '로그인이 필요합니다. 로그인 후 이용해 주세요.',
      confirmButtonColor: '#2563EB',
    });
    return <Navigate to="/" replace />;
  }
  return children;
};

const LootLayout = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const onLoginClick = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const onSignupClick = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleCloseModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={handleCloseModals} onSignupClick={onSignupClick} />
      <SignupModal isOpen={isSignupOpen} onClose={handleCloseModals} onLoginClick={onLoginClick} />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LootLayout />,
    children: [
      { index: true, element: <Main /> },
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'create-topic', element: <CreateTopic /> },
          { path: 'profile', element: <Profile /> },
        ],
      },

      { path: 'topic/:id', element: <SingleTopic /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
