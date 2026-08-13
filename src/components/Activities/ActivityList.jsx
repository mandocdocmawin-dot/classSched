// src/components/Activities/ActivityList.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ActivityList.css';
import { getActivities, toggleActivityStatus, deleteActivity } from '../../utils/activityStorage';
import { calculateActivityStatus } from '../../utils/activityHelpers';
import ActivityForm from './ActivityForm';

const FILTERS = ['All', 'Pending', 'Ongoing', 'Overdue', 'Done'];
const PAGE_SIZE = 5;

const ActivityList = ({ userEmail, sectionCode, classes = [], onActivitiesChange }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [confirmDeleteActivity, setConfirmDeleteActivity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const isModalOpen = showForm || editingActivity !== null;

  const closeModal = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const loadActivities = () => {
    setActivities(getActivities(userEmail, sectionCode));
    if (onActivitiesChange) onActivitiesChange();
  };

  useEffect(() => {
    loadActivities();
  }, [userEmail, sectionCode]);

  const activitiesWithStatus = useMemo(() => {
    return activities.map(activity => ({
      ...activity,
      status: calculateActivityStatus(activity.dueDate, activity.dueTime, activity.isCompleted)
    }));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (filter === 'All') return activitiesWithStatus;
    return activitiesWithStatus.filter(a => a.status === filter);
  }, [activitiesWithStatus, filter]);

  // Sort: Overdue & Ongoing first, then Pending, then Done (per Section 5.3)
  const sortedActivities = useMemo(() => {
    const priority = { Overdue: 0, Ongoing: 0, Pending: 1, Done: 2 };
    return [...filteredActivities].sort((a, b) => {
      const pDiff = priority[a.status] - priority[b.status];
      if (pDiff !== 0) return pDiff;
      return new Date(`${a.dueDate}T${a.dueTime || '23:59'}`) - new Date(`${b.dueDate}T${b.dueTime || '23:59'}`);
    });
  }, [filteredActivities]);

  // Reset back to page 1 whenever the filter changes so the list doesn't
  // land on an empty page from a previous filter's pagination.
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(sortedActivities.length / PAGE_SIZE));

  // Clamp the current page if items were deleted and it now points past
  // the last available page.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedActivities.slice(start, start + PAGE_SIZE);
  }, [sortedActivities, currentPage]);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const openTasksCount = activitiesWithStatus.filter(a => a.status !== 'Done').length;
  const doneCount = activitiesWithStatus.filter(a => a.status === 'Done').length;

  const handleToggle = async (activityId) => {
    await toggleActivityStatus(userEmail, sectionCode, activityId);
    loadActivities();
  };

  const handleDelete = async (activityId) => {
    const deletedTitle = confirmDeleteActivity?.title;
    await deleteActivity(userEmail, sectionCode, activityId);
    loadActivities();
    setConfirmDeleteActivity(null);
    showToast(deletedTitle ? `"${deletedTitle}" was deleted.` : 'Activity deleted.', 'success');
  };

  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <div>
          <h3>My Activities</h3>
          <p className="activity-list-subtitle">
            Assignments, projects, and personal tasks. Optionally linked to a class.
          </p>
        </div>
        <button className="btn-add-activity" onClick={() => setShowForm(true)}>
          + Add Activity
        </button>
      </div>

      {isModalOpen && (
        <div className="activity-modal-overlay" onClick={closeModal}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="activity-modal-close"
              aria-label="Close"
              onClick={closeModal}
            >
              ×
            </button>
            <ActivityForm
              key={editingActivity ? editingActivity.id : 'new'}
              userEmail={userEmail}
              sectionCode={sectionCode}
              classes={classes}
              initialActivity={editingActivity}
              onActivityAdded={() => {
                const wasEditing = Boolean(editingActivity);
                loadActivities();
                closeModal();
                showToast(wasEditing ? 'Activity updated successfully.' : 'Activity added successfully.', 'success');
              }}
            />
          </div>
        </div>
      )}

      <div className="activity-filter-tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f}
          </button>
        ))}
      </div>

      <div className="activity-summary-line">
        {openTasksCount} open &middot; {doneCount} done
      </div>

      {sortedActivities.length === 0 ? (
        <p className="activity-empty-state">
          No activities match this filter. Add one to get started!
        </p>
      ) : (
        <>
        <ul className="activity-list">
          {paginatedActivities.map(activity => (
            <li key={activity.id} className={`activity-item status-${activity.status.toLowerCase()}`}>
              <button
                type="button"
                className={`activity-check-btn${activity.status === 'Done' ? ' is-done' : ''}`}
                onClick={() => handleToggle(activity.id)}
                aria-pressed={activity.status === 'Done'}
                aria-label={activity.status === 'Done' ? `Mark ${activity.title} as not done` : `Mark ${activity.title} as done`}
                title={activity.status === 'Done' ? 'Mark as not done' : 'Mark as done'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="13"
                  height="13"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>

              <div className="activity-details">
                <h4>{activity.title}</h4>
                <p className="activity-meta">
                  {activity.type}
                  {activity.relatedSubject ? ` · ${activity.relatedSubject}` : ''}
                </p>
                <p className="activity-meta">Due: {activity.dueDate} at {activity.dueTime}</p>
              </div>

              <span className="activity-badge">{activity.status}</span>

              <div className="activity-item-actions">
                <button
                  type="button"
                  className="btn-edit-activity"
                  onClick={() => setEditingActivity(activity)}
                  aria-label={`Edit ${activity.title}`}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="btn-delete-activity"
                  onClick={() => setConfirmDeleteActivity(activity)}
                  aria-label={`Delete ${activity.title}`}
                  title="Delete"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="15"
                    height="15"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="activity-pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>
            <span className="pagination-status">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        )}
        </>
      )}

      {confirmDeleteActivity && (
        <div className="activity-modal-overlay" onClick={() => setConfirmDeleteActivity(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="confirm-modal-title">Delete this activity?</h4>
            <p className="confirm-modal-text">
              Are you sure you want to delete "<strong>{confirmDeleteActivity.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setConfirmDeleteActivity(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={() => handleDelete(confirmDeleteActivity.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`activity-toast activity-toast--${toast.type}`} role="status">
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ActivityList;