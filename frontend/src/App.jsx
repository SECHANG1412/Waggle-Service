import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Footer from './Components/Footer/Footer';
import Navbar from './Components/Navbar';
import { AUTH_MESSAGES } from './constants/messages';
import { useAuth } from './hooks/auth-context';
import { AuthProvider } from './hooks/useAuth';
import CreateTopic from './Pages/CreateTopic';
import Login from './Pages/Login';
import Main from './Pages/Main';
import Profile from './Pages/Profile';
import Signup from './Pages/Signup';
import SingleTopic from './Pages/SingleTopic';
import { showLoginRequiredAlert } from './utils/alertUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showLoginRequiredAlert(AUTH_MESSAGES.loginRequiredAfterLogin);
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-slate-500">
        인증 상태를 확인하는 중입니다.
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RootLayout = () => (
  <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
    <Navbar />
    <main className="container mx-auto flex-grow px-4 py-1 lg:px-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#f2f4f7] px-4 py-10">
    <div className="w-full max-w-5xl">
      <Outlet />
    </div>
  </div>
);

const AppRoot = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
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
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/signup', element: <Signup /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
