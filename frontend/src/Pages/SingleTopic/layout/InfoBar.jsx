import React from 'react';
import { FaRegCalendarAlt, FaRegUser } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/date';

const InfoBar = ({ authorName, createdAt, totalVotes }) => {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
        {authorName && (
          <span className="inline-flex items-center gap-2">
            <FaRegUser className="h-4 w-4 shrink-0" />
            <span>{authorName}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <FaRegCalendarAlt className="h-4 w-4 shrink-0" />
          <span>
            {formatDateTime(createdAt, 'ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </span>
      </div>

      <div className="text-gray-700 text-base flex items-center space-x-2 mt-2 font-semibold">
        <span className="text-gray-500">총 투표수</span>
        <span className="text-blue-700">{totalVotes}</span>
      </div>
    </>
  );
};

export default InfoBar;
