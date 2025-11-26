import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const AvatarPlaceholder = ({ name }) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-10 h-10 bg-gray-200 text-gray-800 flex items-center justify-center rounded-full font-bold text-sm cursor-pointer">
      {initials}
    </div>
  );
};

const DesktopAuthButtons = ({
  userName,
  isAuthenticated,
  isOpen,
  setIsOpen,
  onLoginClick,
  onLogoutClick,
  onSignupClick,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div className="hidden md:flex items-center">
      {isAuthenticated ? (
        <div className="relative ml-4" ref={containerRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center focus:outline-none">
            <AvatarPlaceholder name={userName} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                프로필
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                문의하기
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogoutClick();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-3">
          <button
            onClick={onLoginClick}
            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            로그인
          </button>
          <button
            onClick={onSignupClick}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            가입하기
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopAuthButtons;
