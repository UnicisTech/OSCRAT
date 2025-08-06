import React, { useState } from 'react';
import Divider from '@/components/shared/Divider';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---

interface CommentData {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export default function Index() {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  // --- MOCK DATA ---
  const initialComments: CommentData[] = [
    {
      id: 'comment-1',
      author: 'Emily Carter',
      timestamp: '23.04.2025 - 14:35 PM',
      text: 'Assigned Anna Mayer tot he task.',
    },
    {
      id: 'comment-2',
      author: 'Emily Carter',
      timestamp: '12.04.2025 - 14:35 PM',
      text: "A new task has been created, and I'm currently reviewing potential assignees.",
    },
  ];

  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') {
      return;
    }

    const newCommentObject: CommentData = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      timestamp:
        new Date()
          .toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(',', ' -') + ' PM',
      text: newComment,
    };

    setComments([newCommentObject, ...comments]);
    setNewComment('');
  };

  return (
    <div className="flex w-full justify-center">
      <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
        {/* New Comment Form */}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            {t('oscrat.ui.new-comment')}
          </h2>
          <form onSubmit={handleAddComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Placeholder"
              className="mb-2 w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
              rows={4}
            />
            <button
              type="submit"
              className="rounded-md bg-blue-900 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
            >
              {t('oscrat.ui.add-comment')}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="pt-4">
              <Divider />
              <div className="mb-1 flex items-center pt-4">
                <p className="mr-2 text-sm font-semibold text-gray-900">
                  {comment.author}
                </p>
                <p className="text-xs text-gray-900">{comment.timestamp}</p>
              </div>
              <p className="text-sm text-gray-900">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
