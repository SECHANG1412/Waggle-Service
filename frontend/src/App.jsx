import React from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer/Footer';
import Main from './Pages/Main';
import CreateTopic from './Pages/CreateTopic';
import SingleTopic from './Pages/SingleTopic';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Swal from 'sweetalert2';
import { AuthProvider, useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: '로그인이 필요해요',
      text: '로그인 후 이용할 수 있는 메뉴입니다.',
      confirmButtonColor: '#2563EB',
    });
    return <Navigate to="/" replace />;
  }
  return children;
};

const RootLayout = () => (
  <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 lg:px-6 py-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => (
  <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-5xl">
      <Outlet />
    </div>
  </div>
);

// Ensures AuthProvider is inside Router context
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
