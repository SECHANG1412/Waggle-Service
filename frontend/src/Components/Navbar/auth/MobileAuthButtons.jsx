import React from 'react';
import { Link } from 'react-router-dom';

const MobileAuthButtons = ({ isAuthenticated, setIsOpen, onLogoutClick }) => {
  return (
    <div className="pt-2 flex flex-col space-y-2 w-full">
      {isAuthenticated ? (
        <>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 text-left cursor-pointer"
          >
            프로필
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogoutClick();
            }}
            className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 text-left"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 text-left"
          >
            로그인
          </Link>
          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="text-white bg-blue-600 hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 text-left cursor-pointer"
          >
            가입하기
          </Link>
        </>
      )}
    </div>
  );
};

export default MobileAuthButtons;
