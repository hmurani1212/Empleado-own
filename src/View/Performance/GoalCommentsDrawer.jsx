import React, { useEffect, useState, useMemo } from 'react';
import { Typography } from '@material-tailwind/react';
import { FaCommentDots, FaStar } from 'react-icons/fa';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import performanceApi from '../../Model/Data/Performance/Performance';

const GoalCommentsDrawer = ({ open, onClose, goal }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && goal?._id) {
      fetchComments();
    }
  }, [open, goal?._id]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await performanceApi.getGoalComments(goal._id);
      if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL') {
        setComments(response.data.DB_DATA || []);
      } else {
        setComments([]);
        setError(response.data?.ERROR_DESCRIPTION || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const drawerTitle = useMemo(() => {
    if (!goal) return 'Goal Comments';
    return goal.name || goal.title || 'Goal Comments';
  }, [goal]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const drawerContent = (
    <div className="space-y-4 py-2">
        <div className="flex items-center gap-2 text-blue-600">
          <FaCommentDots />
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            Goal Comments
          </Typography>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Typography variant="small" color="gray" className="font-normal">
              Loading comments...
            </Typography>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Typography variant="small" color="red" className="font-normal">
              {error}
            </Typography>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="small" color="gray" className="font-normal">
              No comments found for this goal.
            </Typography>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(comment.entry_time)}</span>
                  <div className="flex items-center gap-1">
                    <FaStar className={`text-base ${comment.rating > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
                    <span>{comment.rating || 0}</span>
                  </div>
                </div>
                <Typography variant="small" color="blue-gray" className="font-normal whitespace-pre-wrap">
                  {comment.comment?.trim() ? comment.comment : 'No comment provided.'}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>
  );

  return (
    <PortalDrawer
      open={open}
      closeDrawer={onClose}
      title={`Comments • ${drawerTitle}`}
      widthSize={520}
      compo={drawerContent}
    />
  );
};

export default GoalCommentsDrawer;

