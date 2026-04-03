import React from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer/Footer';
import Main from './Pages/Main';
import CreateTopic from './Pages/CreateTopic';
import SingleTopic from './Pages/SingleTopic';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/auth-context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-slate-500">
        인증 상태를 확인하는 중입니다.
      </div>
    );
  }

  if (!isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: '로그인이 필요합니다',
      text: '로그인 후 이용할 수 있습니다.',
      confirmButtonColor: '#2563EB',
    });
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
