import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react';
import { ModalLayout, FormButton, FormInput, ErrorMessage, SwitchAuthLink } from '../UI';
import { useAuth } from '../../../hooks/auth-context';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
};

const SignupModal = ({ isOpen, onClose, onLoginClick }: SignupModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const { error, signup } = useAuth();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const success = await signup(formData);
        if (success) {
          setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
          });
          onLoginClick();
        }
      } catch (err) {
        console.error('Signup error:', err);
      }
    },
    [formData, signup, onLoginClick]
  );

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="회원가입">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일" />
        <FormInput type="text" name="username" value={formData.username} onChange={handleChange} placeholder="닉네임" />
        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호"
        />
        <FormInput
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="비밀번호 확인"
        />

        <ErrorMessage error={error} />

        <FormButton>가입하기</FormButton>
      </form>
      <SwitchAuthLink message="이미 계정이 있으신가요?" buttonText="로그인" onClick={onLoginClick} />
    </ModalLayout>
  );
};

export default SignupModal;
