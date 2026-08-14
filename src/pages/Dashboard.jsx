import React, { useState, useEffect, useCallback } from 'react';
import SectionForm from '../components/SectionEntry/SectionForm';
import ScheduleList from '../components/Timeline/ScheduleList';
import WeekGlance from '../components/Timeline/WeekGlance';
import WeekCalendar from '../components/Timeline/WeekCalendar';
import ActivityList from '../components/Activities/ActivityList';
import { getScheduleForSection } from '../services/sheetsAPI';
import { getCurrentDayCode } from '../utils/scheduleHelpers';
import { getActivities } from '../utils/activityStorage';
import { calculateActivityStatus } from '../utils/activityHelpers';
import './Dashboard.css';

function getTabNameFromSection(sectionCode) {
  const match = sectionCode.match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : sectionCode;
}

const SECTION_STORAGE_KEY = 'classsched_active_section';

function getStoredSection() {
  try {
    return localStorage.getItem(SECTION_STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

const Dashboard = ({ accessToken, userEmail, onLogout }) => {
  const [activeSection, setActiveSection] = useState(getStoredSection);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayCode());
  const [activityStats, setActivityStats] = useState({ total: 0, completed: 0 });
  const [activities, setActivities] = useState([]);

  const handleSectionSubmit = (code) => {
    console.log('Loading data for:', code);
    setActiveSection(code);
    try {
      localStorage.setItem(SECTION_STORAGE_KEY, code);
    } catch (e) {
      console.error('Failed to save section:', e);
    }
    setIsModalOpen(false);
    setSelectedDay(getCurrentDayCode());
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SECTION_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear section:', e);
    }
    onLogout();
  };

  useEffect(() => {
    if (!activeSection || !accessToken) return;

    const tabName = getTabNameFromSection(activeSection);

    setIsLoading(true);
    setLoadError(null);

    getScheduleForSection(accessToken, tabName, activeSection)
      .then((data) => {
        setClasses(data);
        if (data.length === 0) {
          setLoadError(
            `Walang nahanap na klase para sa "${activeSection}". I-check kung tama ang section code.`
          );
        }
      })
      .catch((err) => {
        console.error('Failed to load schedule:', err);
        setLoadError('Hindi ma-load ang schedule. Subukan ulit.');
      })
      .finally(() => setIsLoading(false));
  }, [activeSection, accessToken]);

  // Recomputes the "Today's Classes" + "Completed" stat cards from the local
  // activities cache. ActivityList calls this (via onActivitiesChange) any
  // time it adds/toggles/deletes an activity, so the cards stay in sync.
  const refreshActivityStats = useCallback(() => {
    if (!userEmail || !activeSection) {
      setActivityStats({ total: 0, completed: 0 });
      setActivities([]);
      return;
    }
    const stored = getActivities(userEmail, activeSection);
    const total = stored.length;
    const completed = stored.filter(
      (a) => calculateActivityStatus(a.dueDate, a.dueTime, a.isCompleted) === 'Done'
    ).length;
    setActivityStats({ total, completed });
    setActivities(stored);
  }, [userEmail, activeSection]);

  useEffect(() => {
    refreshActivityStats();
  }, [refreshActivityStats]);

  // NOTE: assumes each class object has a `day` field using the same codes
  // returned by getCurrentDayCode() (e.g. 'THU') — same convention already
  // used for filterDay/selectedDay above. Adjust the field name below if
  // your schedule objects use a different key.
  const todaysClassesCount = classes.filter((c) => c.day === getCurrentDayCode()).length;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Weekly Schedule</h1>
          <p className="dashboard__subtitle">
            {activeSection
              ? `Showing recurring sessions for ${activeSection}.`
              : 'Set your program & year to load your sessions.'}
          </p>
        </div>
        <button className="dashboard__add-btn" onClick={() => setIsModalOpen(true)}>
          <span aria-hidden="true">+</span> {activeSection ? 'Add New' : 'Set Section'}
        </button>
      </header>

      <SectionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSection={handleSectionSubmit}
      />

      {activeSection ? (
        isLoading ? (
          <div className="dashboard__empty">
            <p className="dashboard__empty-text">Loading your schedule...</p>
          </div>
        ) : loadError ? (
          <div className="dashboard__empty">
            <span className="dashboard__empty-icon" aria-hidden="true">
              ⚠️
            </span>
            <p className="dashboard__empty-text">{loadError}</p>
            <button className="dashboard__empty-cta" onClick={() => setIsModalOpen(true)}>
              Try Another Section
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard__grid">
              <div className="dashboard__slot-stats">
                <div className="dashboard__stats">
                  <div className="dashboard__stat-card">
                    <span className="dashboard__stat-value">{todaysClassesCount}</span>
                    <span className="dashboard__stat-label">Today's Classes</span>
                  </div>
                  <div className="dashboard__stat-card">
                    <span className="dashboard__stat-value">
                      {activityStats.completed}/{activityStats.total}
                    </span>
                    <span className="dashboard__stat-label">Activities Completed</span>
                  </div>
                </div>
              </div>
              <div className="dashboard__slot-list">
                <ScheduleList
                  classes={classes}
                  filterDay={selectedDay}
                  onFilterDayChange={setSelectedDay}
                  userEmail={userEmail}
                />
              </div>
              <div className="dashboard__slot-calendar">
                <WeekCalendar
                  classes={classes}
                  activities={activities}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              </div>
              <div className="dashboard__slot-week">
                <WeekGlance classes={classes} />
              </div>
            </div>

            <div className="dashboard__slot-activities">
              <ActivityList
                userEmail={userEmail}
                sectionCode={activeSection}
                classes={classes}
                onActivitiesChange={refreshActivityStats}
              />
            </div>
          </>
        )
      ) : (
        <div className="dashboard__empty">
          <span className="dashboard__empty-icon" aria-hidden="true">
            🎫
          </span>
          <p className="dashboard__empty-text">
          </p>
          <button className="dashboard__empty-cta" onClick={() => setIsModalOpen(true)}>
            + Set Section
          </button>
        </div>
      )}

      <button className="dashboard__logout" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
};

export default Dashboard;