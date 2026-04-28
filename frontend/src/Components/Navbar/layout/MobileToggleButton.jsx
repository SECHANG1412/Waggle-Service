const MobileToggleButton = ({ isOpen, toggle }) => (
  <div className="lg:hidden">
    <button
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-800 hover:bg-gray-100"
      aria-label="모바일 메뉴 열기"
      aria-expanded={isOpen}
    >
      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  </div>
);

export default MobileToggleButton;
