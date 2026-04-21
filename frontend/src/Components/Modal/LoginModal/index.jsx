import React, { useCallback, useMemo, useState } from 'react';
import { ModalLayout, ErrorMessage, FormButton, FormInput, SwitchAuthLink } from '../Ui';
import { useAuth } from '../../../hooks/auth-context';
import SocialAuthButtons from '../../Auth/SocialAuthButtons';

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

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="로그인">
      <div className="space-y-4">
        <SocialAuthButtons baseUrl={baseUrl} />

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex-1 h-px bg-gray-200" />
          <span>또는</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormInput
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일"
          />

          <FormInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
          />

          <ErrorMessage error={error} />
          <FormButton classname="bg-gray-200 text-gray-600 hover:bg-gray-300 font-semibold">
            계속하기
          </FormButton>
        </form>

        <SwitchAuthLink
          message="아직 계정이 없으신가요?"
          buttonText="회원가입"
          onClick={onSignupClick}
        />
      </div>
    </ModalLayout>
  );
};

export default LoginModal;
