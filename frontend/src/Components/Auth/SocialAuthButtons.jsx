import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiKakaotalk, SiNaver } from 'react-icons/si';

const SocialAuthButtons = ({ baseUrl }) => (
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

export default SocialAuthButtons;
