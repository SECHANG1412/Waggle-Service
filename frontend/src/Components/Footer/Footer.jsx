import React from 'react';

const Footer = () => {
  const quickLinks = [
    { label: '홈', url: '/' },
    { label: '프로필', url: '/profile' },
    { label: '문의', url: '/contact' },
  ];

  const contactInfo = ['waggle1212@gmail.com'];

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 모바일에서는 최소 정보만 보여주고, 데스크톱 이상에서만 상세 푸터 노출 */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Us */}
          <div>
            <h3 className="text-base font-semibold mb-3">서비스 소개</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              함께 정하고, 투표하고, 공유하세요.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:pl-6">
            <h3 className="text-base font-semibold mb-3">바로가기</h3>
            <ul className="flex gap-4 text-sm text-gray-600">
              {quickLinks.map(({ label, url }) => (
                <li key={label}>
                  <a href={url} className="hover:text-gray-900">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-3">문의</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {contactInfo.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">&copy; 2025 Waggle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
