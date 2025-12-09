import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { SiNaver, SiKakaotalk } from 'react-icons/si';
import { useAuth } from '../hooks/useAuth';

const SocialButtons = ({ baseUrl }) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <button
        type="button"
        onClick={() => (window.location.href = `${baseUrl}/auth/google/login`)}
        className="flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
      >
        <FcGoogle className="text-2xl" />
        <span className="text-sm font-semibold text-gray-800">Google</span>
      </button>
      <button
        type="button"
        onClick={() => (window.location.href = `${baseUrl}/auth/naver/login`)}
        className="flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition text-green-700"
      >
        <SiNaver className="text-lg" />
        <span className="text-sm font-semibold">Naver</span>
      </button>
      <button
        type="button"
        onClick={() => (window.location.href = `${baseUrl}/auth/kakao/login`)}
        className="flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition text-[#3c1e1e]"
      >
        <SiKakaotalk className="text-lg" />
        <span className="text-sm font-semibold">Kakao</span>
      </button>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { error, login } = useAuth();
  const navigate = useNavigate();
  const baseUrl = useMemo(() => import.meta.env.VITE_API_URL || '', []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      }
    },
    [formData.email, formData.password, login, navigate]
  );

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-3xl border border-gray-100 p-8 md:p-10">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Waggle에 오신 것을 환영합니다.</h1>
          <p className="text-sm text-gray-500">투표 커뮤니티에서 함께 의견을 나눠보세요.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 block">SNS 로그인</span>
            <SocialButtons baseUrl={baseUrl} />
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex-1 h-px bg-gray-200" />
            <span>또는</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              로그인
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            아직 회원이 아니신가요?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
