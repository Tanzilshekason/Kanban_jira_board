import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    group_by: 'task',
    user_id: '',
    task_id: '',
    start_date: '',
    end_date: '',
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      // Build query params
      const params = {};
      if (filters.group_by) params.group_by = filters.group_by;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.task_id) params.task_id = filters.task_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const data = await reportsAPI.getTimeReport(params, token);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleReset = () => {
    setFilters({
      group_by: 'task',
      user_id: '',
      task_id: '',
      start_date: '',
      end_date: '',
    });
    fetchReport();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTaskReport = () => {
    if (!reportData?.data) return null;
    
    return (
      <div className="report-section">
        <h3>Time Logs by Task</h3>
        <div className="report-summary">
          <div className="summary-card">
            <span className="summary-label">Total Tasks</span>
            <span className="summary-value">{reportData.data.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Grand Total Hours</span>
            <span className="summary-value">{reportData.grand_total_hours?.toFixed(1)}h</span>
          </div>
        </div>
        
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map(item => (
                <tr key={item.task_id}>
                  <td>
                    <div className="task-title">{item.title}</div>
                    <div className="task-id">ID: {item.task_id}</div>
                  </td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{item.assignee || 'Unassigned'}</td>
                  <td className="hours-cell">
                    <span className="hours-value">{item.total_hours.toFixed(1)}h</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUserReport = () => {
    if (!reportData?.data) return null;
    
    return (
      <div className="report-section">
        <h3>Time Logs by User</h3>
        <div className="report-summary">
          <div className="summary-card">
            <span className="summary-label">Total Users</span>
            <span className="summary-value">{reportData.data.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Grand Total Hours</span>
            <span className="summary-value">{reportData.grand_total_hours?.toFixed(1)}h</span>
          </div>
        </div>
        
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Total Hours</th>
                <th>Tasks Worked On</th>
                <th>Avg Hours per Task</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map(item => (
                <tr key={item.user_id}>
                  <td>
                    <div className="user-name">{item.first_name} {item.last_name}</div>
                    <div className="user-username">@{item.username}</div>
                  </td>
                  <td className="hours-cell">
                    <span className="hours-value">{item.total_hours.toFixed(1)}h</span>
                  </td>
                  <td>
                    <div className="tasks-list">
                      {item.tasks?.slice(0, 3).map(task => (
                        <div key={task.task_id} className="task-chip">
                          {task.title}: {task.hours.toFixed(1)}h
                        </div>
                      ))}
                      {item.tasks?.length > 3 && (
                        <div className="task-chip-more">
                          +{item.tasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.tasks?.length > 0 
                      ? (item.total_hours / item.tasks.length).toFixed(1) + 'h'
                      : '0h'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDayReport = () => {
    if (!reportData?.data) return null;
    
    return (
      <div className="report-section">
        <h3>Time Logs by Day</h3>
        <div className="report-summary">
          <div className="summary-card">
            <span className="summary-label">Days Covered</span>
            <span className="summary-value">{reportData.data.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Grand Total Hours</span>
            <span className="summary-value">{reportData.grand_total_hours?.toFixed(1)}h</span>
          </div>
        </div>
        
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Hours</th>
                <th>Activities</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map(item => (
                <tr key={item.date}>
                  <td>
                    <div className="date-display">{formatDate(item.date)}</div>
                    <div className="date-day">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  </td>
                  <td className="hours-cell">
                    <span className="hours-value">{item.total_hours.toFixed(1)}h</span>
                  </td>
                  <td>
                    <div className="activities-list">
                      {item.logs?.slice(0, 2).map((log, idx) => (
                        <div key={idx} className="activity-chip">
                          {log.task_title}: {log.hours}h
                        </div>
                      ))}
                      {item.logs?.length > 2 && (
                        <div className="activity-chip-more">
                          +{item.logs.length - 2} more activities
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (!reportData) return null;
    
    switch (reportData.group_by) {
      case 'task':
        return renderTaskReport();
      case 'user':
        return renderUserReport();
      case 'day':
        return renderDayReport();
      default:
        return (
          <div className="no-data">
            <p>No report data available for the selected grouping.</p>
          </div>
        );
    }
  };

  return (
    <div className="reports-page">

      <div className="reports-container">
        <div className="filters-panel">
          <h3>Report Filters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="group_by">Group By</label>
              <select
                id="group_by"
                name="group_by"
                value={filters.group_by}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="task">By Task</option>
                <option value="user">By User</option>
                <option value="day">By Day</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn-primary">
                Apply Filters
              </button>
              <button type="button" onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="report-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading report data...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Report</h3>
              <p>{error}</p>
              <button onClick={fetchReport} className="btn-primary">
                Try Again
              </button>
            </div>
          ) : (
            renderReportContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;