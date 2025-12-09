import React, { useCallback, useMemo, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiKakaotalk, SiNaver } from 'react-icons/si';
import { ModalLayout, ErrorMessage, FormButton, FormInput, SwitchAuthLink } from '../Ui';
import { useAuth } from '../../../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSignupClick }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { error, login } = useAuth();
  const baseUrl = useMemo(() => import.meta.env.VITE_API_URL || '', []);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const success = await login(formData.email, formData.password);
        if (success) {
          onClose();
        }
      } catch (err) {
        console.error('Login error:', err);
      }
    },
    [formData, login, onClose]
  );

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${baseUrl}/auth/google/login`;
  }, [baseUrl]);

  const handleNaverLogin = useCallback(() => {
    window.location.href = `${baseUrl}/auth/naver/login`;
  }, [baseUrl]);

  const handleKakaoLogin = useCallback(() => {
    window.location.href = `${baseUrl}/auth/kakao/login`;
  }, [baseUrl]);

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Welcome to Waggle">
      <div className="space-y-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#1a73e8] text-white font-semibold py-3 rounded-lg hover:bg-[#155fc2] transition-colors shadow-sm"
          >
            <FcGoogle className="text-2xl bg-white rounded-full p-1" />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#03c75a] text-white font-semibold py-3 rounded-lg hover:brightness-95 transition-colors shadow-sm"
          >
            <SiNaver className="text-xl" />
            <span>Continue with Naver</span>
          </button>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#fee500] text-[#3c1e1e] font-semibold py-3 rounded-lg hover:brightness-95 transition-colors shadow-sm"
          >
            <SiKakaotalk className="text-xl" />
            <span>Continue with Kakao</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex-1 h-px bg-gray-200" />
          <span>OR</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
          />

          <FormInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />

          <ErrorMessage error={error} />
          <FormButton classname="bg-gray-200 text-gray-600 hover:bg-gray-300 font-semibold">
            Continue
          </FormButton>
        </form>

        <SwitchAuthLink
          message="Don't have an account?"
          buttonText="Sign up"
          onClick={onSignupClick}
        />
      </div>
    </ModalLayout>
  );
};

export default LoginModal;
