import React from 'react';

const EditableContent = ({
  isEditing,
  content,
  editContent,
  setEditContent,
  onEdit,
  setIsEditing,
  isReply = false,
}) => {
  if (isEditing) {
    return (
      <div className="mt-2">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className={`w-full resize-none rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 ${
            isReply ? 'text-sm' : ''
          }`}
          rows={isReply ? 2 : 3}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="min-h-10 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onEdit}
            disabled={!editContent.trim()}
            className="min-h-10 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-500/50"
          >
            수정
          </button>
        </div>
      </div>
    );
  }

  const mentionPrefix = content.startsWith('@') ? content.split(/\s+/)[0] : null;
  const restContent = mentionPrefix ? content.slice(mentionPrefix.length) : content;

  return (
    <p className={`mt-1 break-words whitespace-pre-wrap text-gray-800 ${isReply ? 'text-sm' : ''}`}>
      {mentionPrefix ? <span className="text-blue-600 font-semibold">{mentionPrefix}</span> : null}
      {restContent}
    </p>
  );
};

export default EditableContent;
