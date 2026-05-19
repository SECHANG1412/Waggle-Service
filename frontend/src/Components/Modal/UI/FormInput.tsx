import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

type FormInputProps = {
  type: HTMLInputTypeAttribute;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  required?: boolean;
};

const FormInput = ({ type, name, value, onChange, placeholder, required = true }: FormInputProps) => {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        required={required}
      />
    </div>
  );
};

export default FormInput;
