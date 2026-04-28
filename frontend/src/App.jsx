import React, { useEffect, useState } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import Footer from './Components/Footer/Footer';
import Navbar from './Components/Navbar';
import { AUTH_MESSAGES } from './constants/messages';
import { useAuth } from './hooks/auth-context';
import { AuthProvider } from './hooks/useAuth';
import Admin from './Pages/Admin';
import AdminComments from './Pages/Admin/Comments';
import AdminInquiries from './Pages/Admin/Inquiries';
import AdminLogs from './Pages/Admin/Logs';
import AdminTopics from './Pages/Admin/Topics';
import Contact from './Pages/Contact';
import CreateTopic from './Pages/CreateTopic';
import Login from './Pages/Login';
import Main from './Pages/Main';
import Profile from './Pages/Profile';
import Signup from './Pages/Signup';
import SingleTopic from './Pages/SingleTopic';
import api from './utils/api';
import { showLoginRequiredAlert } from './utils/alertUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showLoginRequiredAlert(AUTH_MESSAGES.loginRequiredAfterLogin);
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-slate-500">
        로그인 상태를 확인하고 있습니다.
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
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

const AdminRoute = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async () => {
      if (isAuthLoading) return;
      if (!isAuthenticated) {
        setStatus('login-required');
        return;
      }

      setStatus('checking');

      try {
        await api.get('/manage-api/me');
        if (mounted) setStatus('allowed');
      } catch (error) {
        if (!mounted) return;
        if (error.response?.status === 403) {
          setStatus('forbidden');
          return;
        }
        if (error.response?.status === 401) {
          setStatus('login-required');
          return;
        }
        setStatus('error');
      }
    };

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || status === 'checking') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-slate-500">
        관리자 권한을 확인하고 있습니다.
      </div>
    );
  }

  if (status === 'login-required') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (status === 'forbidden') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col justify-center px-4 py-16">
        <p className="text-sm font-semibold text-blue-600">접근 권한 없음</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">관리자만 접근할 수 있습니다.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          현재 계정에는 관리자 권한이 없습니다. 서비스 이용은 메인 화면에서 계속할 수 있습니다.
        </p>
        <NavigateButton to="/">메인으로 돌아가기</NavigateButton>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col justify-center px-4 py-16">
        <p className="text-sm font-semibold text-red-600">확인 실패</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">관리자 권한을 확인하지 못했습니다.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

const NavigateButton = ({ to, children }) => (
  <Link
    to={to}
    className="mt-6 inline-flex w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
  >
    {children}
  </Link>
);

const NotFound = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col justify-center px-4 py-16 text-center">
    <p className="text-sm font-semibold text-blue-600">404</p>
    <h1 className="mt-3 text-2xl font-bold text-slate-900">페이지를 찾을 수 없습니다.</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">
      입력한 주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.
    </p>
    <Link
      to="/"
      className="mx-auto mt-6 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      홈으로 돌아가기
    </Link>
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
          { path: 'contact', element: <Contact /> },
          {
            path: 'manage',
            element: <AdminRoute />,
            children: [
              { index: true, element: <Admin /> },
              { path: 'inquiries', element: <AdminInquiries /> },
              { path: 'topics', element: <AdminTopics /> },
              { path: 'comments', element: <AdminComments /> },
              { path: 'logs', element: <AdminLogs /> },
            ],
          },
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
          { path: '*', element: <NotFound /> },
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
