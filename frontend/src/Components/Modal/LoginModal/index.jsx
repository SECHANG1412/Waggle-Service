import React, { useCallback, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { ModalLayout, ErrorMessage, FormButton, FormInput, SwitchAuthLink } from '../Ui';
import { useAuth } from '../../../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSignupClick }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { error, login } = useAuth();

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
    const baseUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${baseUrl}/auth/google/login`;
  }, []);

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Welcome to Waggle">
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#1a73e8] text-white font-semibold py-3 rounded-lg hover:bg-[#155fc2] transition-colors shadow-sm"
        >
          <FcGoogle className="text-2xl bg-white rounded-full p-1" />
          <span>Continue with Google</span>
        </button>

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
