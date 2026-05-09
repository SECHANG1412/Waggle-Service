import React from 'react';
import { FaChartBar, FaShieldAlt, FaTag } from 'react-icons/fa';

const InfoBar = ({ totalVotes, category }) => {
  const items = [
    {
      icon: <FaChartBar className="h-5 w-5 text-blue-600" />,
      label: '총 투표수',
      value: `${totalVotes}표`,
    },
    {
      icon: <FaShieldAlt className="h-5 w-5 text-blue-600" />,
      label: '투표 규칙',
      value: '한 번만 투표 가능',
    },
    {
      icon: <FaTag className="h-5 w-5 text-blue-600" />,
      label: '카테고리',
      value: category || '카테고리 없음',
    },
  ];

  return (
    <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 sm:justify-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-slate-500">{item.label}</span>
            <span className="block truncate text-sm font-bold text-slate-800 sm:text-base">{item.value}</span>
          </span>
        </div>
      ))}
    </section>
  );
};

export default InfoBar;
