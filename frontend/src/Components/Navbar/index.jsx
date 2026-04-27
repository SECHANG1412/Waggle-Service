import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Logo from './layout/Logo';
import DesktopAuthButtons from './auth/DesktopAuthButtons';
import MobileMenu from './layout/MobileMenu';
import MobileToggleButton from './layout/MobileToggleButton';
import Categories from './layout/Categories';
import SearchMenu from './layout/SearchMenu';
import { useAuth } from '../../hooks/auth-context';

const Navbar = () => {
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isAuthenticated, user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const category = searchParams.get('category') || '';
  const isAdmin = Boolean(user?.is_admin);

  const onLogoutClick = () => {
    logout();
  };

  const onCategoryClick = (newCategory) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('category', newCategory === '전체' ? '' : newCategory);
    updated.set('page', '1');
    setSearchParams(updated);
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const onSearchSubmit = () => {
    const updated = new URLSearchParams(searchParams);
    if (searchInput) {
      updated.set('search', searchInput);
    } else {
      updated.delete('search');
    }
    updated.set('page', '1');
    setSearchParams(updated);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 py-2">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="w-full lg:w-1/2">
            <SearchMenu
              searchValue={searchInput}
              onSearchInputChange={(e) => setSearchInput(e.target.value)}
              onSearchSubmit={onSearchSubmit}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/create-topic"
                className="hidden lg:inline-flex items-center rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
              >
                토픽 만들기
              </Link>
            )}
            <DesktopAuthButtons
              userName={user?.username || 'User'}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              isOpen={isDesktopMenuOpen}
              setIsOpen={setIsDesktopMenuOpen}
              onLogoutClick={onLogoutClick}
            />
            <MobileToggleButton
              isOpen={isMobileMenuOpen}
              toggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>

        <div className="mt-3">
          <Categories activeCategory={category} onClick={onCategoryClick} />
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogoutClick={onLogoutClick}
        searchValue={searchInput}
        onSearchInputChange={(e) => setSearchInput(e.target.value)}
        onSearchSubmit={onSearchSubmit}
      />
    </nav>
  );
};

export default Navbar;
