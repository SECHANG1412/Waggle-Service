import React from 'react';
import { Link } from 'react-router-dom';

const MobileAuthButtons = ({ isAuthenticated, setIsOpen, onLogoutClick }) => {
  return (
    <div className="w-full space-y-2 pt-2">
      {isAuthenticated ? (
        <>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="block w-full rounded-md px-3 py-2 text-left text-base font-semibold text-gray-800 transition-all duration-200 hover:bg-gray-100"
          >
            프로필
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogoutClick();
            }}
            className="block w-full rounded-md px-3 py-2 text-left text-base font-semibold text-gray-800 transition-all duration-200 hover:bg-gray-100"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block w-full rounded-md px-3 py-2 text-left text-base font-semibold text-gray-800 transition-all duration-200 hover:bg-gray-100"
          >
            로그인
          </Link>
          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="block w-full cursor-pointer rounded-md bg-blue-600 px-3 py-2 text-left text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700"
          >
            회원가입
          </Link>
        </>
      )}
    </div>
  );
};

export default MobileAuthButtons;
