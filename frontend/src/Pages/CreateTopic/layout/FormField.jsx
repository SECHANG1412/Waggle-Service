import React from 'react';

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  maxLength,
  helperText,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          placeholder={placeholder}
        />
      )}
      {helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default FormField;
