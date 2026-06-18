import React, { useState } from 'react';
import Divider from '@/components/shared/Divider';
import Button from '@/components/button';
import { useTranslation } from 'next-i18next';
import { formatDateTime } from '@/utils/dateFormat';

// --- TYPE DEFINITIONS ---

interface CommentData {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export default function Index() {
  const { t, ready } = useTranslation('common');

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
      timestamp: formatDateTime(new Date()),
      text: newComment,
    };

    setComments([newCommentObject, ...comments]);
    setNewComment('');
  };

  if (!ready) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="border-line bg-surface rounded-card w-full border p-4">
        {/* New Comment Form */}
        <div className="mb-6">
          <h2 className="text-content mb-2 text-sm font-semibold">
            {t('oscrat.ui.new-comment')}
          </h2>
          <form onSubmit={handleAddComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Placeholder"
              className="border-line rounded-input mb-2 w-full border px-3 py-2 text-sm"
              rows={4}
            />
            <Button type="submit" variant="primary" size="m">
              {t('oscrat.ui.add-comment')}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="pt-4">
              <Divider />
              <div className="mb-1 flex items-center pt-4">
                <p className="text-content mr-2 text-sm font-semibold">
                  {comment.author}
                </p>
                <p className="text-content text-xs">{comment.timestamp}</p>
              </div>
              <p className="text-content text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
