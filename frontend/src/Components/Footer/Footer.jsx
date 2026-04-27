import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'Profile', url: '/profile' },
    { label: 'Contact', url: '/contact' },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900">Waggle</h3>
            <p className="max-w-xs text-sm leading-6 text-gray-600">
              Vote and discuss ideas.
            </p>
          </div>

          <nav aria-label="Footer quick links">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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
            <h3 className="mb-3 text-base font-semibold text-gray-900">Email</h3>
            <p className="text-sm text-gray-600">waggle0123@gmail.com</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; 2026 Waggle. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
