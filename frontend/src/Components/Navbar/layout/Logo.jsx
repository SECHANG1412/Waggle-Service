import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to={'/'} className="text-white font-bold text-xl flex-shrink-0">
      TalkAndVote
    </Link>
  );
};

export default Logo;
