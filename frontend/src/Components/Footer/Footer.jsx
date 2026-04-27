import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { label: '홈', url: '/' },
    { label: '프로필', url: '/profile' },
    { label: '문의', url: '/contact' },
  ];

  const contactInfo = ['waggle1212@gmail.com'];

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-base font-semibold">Waggle</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              투표와 댓글로 다양한 의견을 나누는 커뮤니티입니다.
            </p>
          </div>

          <nav className="md:pl-6" aria-label="푸터 바로가기">
            <h3 className="mb-3 text-base font-semibold">바로가기</h3>
            <ul className="flex flex-wrap gap-4 text-sm text-gray-600">
              {quickLinks.map(({ label, url }) => (
                <li key={label}>
                  <Link to={url} className="hover:text-gray-900">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-3 text-base font-semibold">문의</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {contactInfo.map((info) => (
                <li key={info}>{info}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">&copy; 2025 Waggle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
