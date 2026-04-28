import React from 'react';
import SharedNavLinks from '../shared/SharedNavLinks';
import MobileAuthButtons from '../auth/MobileAuthButtons';

const MobileMenu = ({
  isOpen,
  setIsOpen,
  isAuthenticated,
  isAdmin,
  onLogoutClick,
}) => {
  return (
    <div
      className={`lg:hidden transform transition-all duration-300 ease-in-out ${
        isOpen
          ? 'max-h-[80vh] translate-y-0 overflow-y-auto border-t border-gray-200 bg-white opacity-100 shadow-sm'
          : 'pointer-events-none max-h-0 -translate-y-2 overflow-hidden opacity-0'
      }`}
    >
      <div className="space-y-3 px-4 pt-3 pb-4">
        <div className="border-b border-gray-200 pb-2">
          <SharedNavLinks
            linkClassName="block min-h-11 rounded-md px-3 py-2.5 text-base font-semibold text-gray-800 transition-colors hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <MobileAuthButtons
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          setIsOpen={setIsOpen}
          onLogoutClick={onLogoutClick}
        />
      </div>
    </div>
  );
};

export default MobileMenu;
