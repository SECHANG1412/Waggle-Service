import React from 'react';
import { FaEdit, FaHeart, FaRegComment, FaTrash } from 'react-icons/fa';

const CommentActions = ({
  hasLiked,
  likeCount,
  onLikeClick,
  onReplyClick,
  onEditClick,
  onDeleteClick,
  hideOwnerActions = false,
}) => {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2 text-sm text-gray-500">
      <button
        onClick={onLikeClick}
        className={`inline-flex h-9 items-center gap-1 rounded-md px-2 transition-colors ${
          hasLiked ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-blue-500'
        }`}
        aria-label="Like"
        title="Like"
      >
        <FaHeart className={`h-5 w-5 ${hasLiked ? 'fill-blue-600' : 'fill-none stroke-[20] stroke-black'}`} />
        <span className="text-sm">{likeCount}</span>
      </button>

      <button
        onClick={onReplyClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-blue-500"
        aria-label="Reply"
        title="Reply"
      >
        <FaRegComment className="h-4 w-4" />
      </button>

      {!hideOwnerActions && (
        <>
          <button
            onClick={onEditClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-blue-500"
            aria-label="Edit"
            title="Edit"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={onDeleteClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-red-500"
            aria-label="Delete"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default CommentActions;
