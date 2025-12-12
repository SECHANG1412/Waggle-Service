import React from 'react';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'Profile', url: '/profile' },
    { label: 'Contact', url: '/contact' },
  ];

  const contactInfo = ['Email: waggle1212@gmail.com'];

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Us */}
          <div>
            <h3 className="text-base font-semibold mb-3">About Us</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Decide together. Create, Vote, Share.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:pl-6">
            <h3 className="text-base font-semibold mb-3">Quick Links</h3>
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
            <h3 className="text-base font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {contactInfo.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">&copy; 2025 Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
