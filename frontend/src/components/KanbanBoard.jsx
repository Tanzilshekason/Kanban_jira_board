import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, boardAPI, authAPI, timeAPI, assignmentAPI } from '../services/api';


const Column = ({ column, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const style = {
    backgroundColor: isOver ? 'var(--jira-blue)' : 'transparent',
    opacity: isOver ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-column"
    >
      <div className="column-header">
        <h3>{column.title || column.name}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="tasks-list">
        {tasks.map(task => (
          <SortableTask
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
      {column.id === 'backlog' && (
        <button className="add-task-btn" onClick={() => onAddTask(column.id)}>
          + Add Task
        </button>
      )}
    </div>
  );
};

const SortableTask = ({ task, onClick }) => {
  const { 
    setNodeRef, 
    transform, 
    transition, 
    isDragging,
    attributes,
    listeners 
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };



  const priorityIcons = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
  const assigneeInitials = task.assignee 
    ? `${(task.assignee.first_name || '')[0] || ''}${(task.assignee.last_name || '')[0] || ''}`.toUpperCase() 
    : '?';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card priority-card-${task.priority || 'medium'}`}
      onClick={onClick}
    >
      {/* Top row: Task ID + Priority badge */}
      <div className="card-top-row">
        <span className="task-id-chip">#{task.id}</span>
        <span className={`priority-badge priority-${task.priority || 'medium'}`}>
          {priorityIcons[task.priority] || '🟡'} {task.priority || 'Medium'}
        </span>
      </div>

      {/* Title */}
      <h4 className="card-title">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="task-description">{task.description.substring(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
      )}

      {/* Metadata chips */}
      <div className="card-meta-chips">
        {task.due_date && (
          <span className={`meta-chip due-chip ${new Date(task.due_date) < new Date() ? 'overdue' : ''}`}>
            📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}

        {task.time_estimate && (
          <span className="meta-chip estimate-chip">
            📊 Est: {parseFloat(task.time_estimate).toFixed(1)}h
          </span>
        )}
      </div>

      {/* Footer: Creator, Assignee avatar, Time log */}
      <div className="card-footer">
        <div className="card-footer-left">
          <span className="card-creator">
            ✍️ {task.created_by ? `${task.created_by.first_name || ''} ${(task.created_by.last_name || '')[0] || ''}.`.trim() : 'Unknown'}
          </span>
        </div>
        <div className="card-footer-right">

          <div className="assignee-avatar" title={task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Unassigned'}>
            {assigneeInitials}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { user: _user } = useAuth(); // Prefix with underscore to indicate intentional non-use
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);


  const getColumnColor = (id) => {
    const colors = {
      backlog: 'bg-gray-100',
      todo: 'bg-blue-100',
      in_progress: 'bg-yellow-100',
      in_review: 'bg-purple-100',
      testing: 'bg-orange-100',
      done: 'bg-green-100',
      blocked: 'bg-red-100',
      archived: 'bg-gray-200',
    };
    return colors[id] || 'bg-gray-100';
  };

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const [columnsResponse, tasksResponse] = await Promise.all([
        boardAPI.getColumns(token),
        tasksAPI.getAll(token),
      ]);

      const columnDefinitions = columnsResponse.map(col => ({
        ...col,
        color: getColumnColor(col.id)
      }));

      setColumns(columnDefinitions);
      setTasks(tasksResponse);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching board data:', error);
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Disable React compiler rule for data fetching in useEffect
    // This is a common pattern for initial data loading
    (async () => {
      await fetchBoardData();
    })();
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    let targetColumnId = null;
    if (over.data.current?.type === 'column') {
      targetColumnId = over.data.current.column.id;
    } else if (over.data.current?.type === 'task') {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        targetColumnId = overTask.status;
      }
    } else {
      const overColumn = columns.find(c => c.id === over.id);
      if (overColumn) targetColumnId = overColumn.id;
    }

    if (!targetColumnId) return;

    const token = localStorage.getItem('access_token');

    // Case 1: Reordering within the same column
    if (activeTask.status === targetColumnId) {
      if (active.id !== over.id) {
        const columnTasks = getTasksForColumn(targetColumnId);
        const oldIndex = columnTasks.findIndex(t => t.id === active.id);
        const newIndex = columnTasks.findIndex(t => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
          
          // Update local state first for immediate UI response
          setTasks(prev => {
            const updated = [...prev];
            reorderedTasks.forEach((task, index) => {
              const idx = updated.findIndex(t => t.id === task.id);
              if (idx !== -1) updated[idx] = { ...updated[idx], order: index };
            });
            return updated;
          });

          // Sync with server (minimal update: the one that moved)
          try {
            const updatedTask = await tasksAPI.update(active.id, { order: newIndex }, token);
            // Ensure the specific task in state is fully in sync with backend response
            setTasks(prev => prev.map(t => t.id === active.id ? updatedTask : t));
          } catch (error) {
            console.error('Error syncing order:', error);
          }
        }
      }
      return;
    }

    // Case 2: Moving to a different column
    try {
      const colTasks = getTasksForColumn(targetColumnId);
      const newOrder = colTasks.length;
      
      const updatedTask = await tasksAPI.update(activeTask.id, { 
        status: targetColumnId,
        order: newOrder 
      }, token);
      
      setTasks(prev => prev.map(task =>
        task.id === activeTask.id
          ? updatedTask
          : task
      ));
      
      fetchAssignmentHistoryForActiveTask(activeTask.id);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Helper to refresh task history if needed
  const fetchAssignmentHistoryForActiveTask = async () => {
    // This is optional but can be useful if history is displayed elsewhere
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (taskData) => {
    const token = localStorage.getItem('access_token');
    if (selectedTask) {
      // Update existing task
      const updatedTask = await tasksAPI.update(selectedTask.id, taskData, token);
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? updatedTask : t
      ));
    } else {
      // Create new task — always defaults to backlog, appended at bottom
      const targetColumn = selectedColumn || 'backlog';
      const columnTasks = getTasksForColumn(targetColumn);
      const newTask = await tasksAPI.create({
        ...taskData,
        status: targetColumn,
        order: columnTasks.length,
      }, token);
      setTasks(prev => [...prev, newTask]);
    }
    setShowTaskModal(false);
    setSelectedTask(null);
    setSelectedColumn(null);
  };



  const getTasksForColumn = (columnId) => {
    return tasks
      .filter(task => task.status === columnId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Kanban board...</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="columns-container">
          {columns.map(column => (
            <SortableContext
              key={column.id}
              items={getTasksForColumn(column.id).map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                column={column}
                tasks={getTasksForColumn(column.id)}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="task-card dragging">
              <div className="task-header">
                <h4>{activeTask.title}</h4>
                <span className={`priority-badge priority-${activeTask.priority || 'medium'}`}>
                  {activeTask.priority || 'Medium'}
                </span>
              </div>
              <p className="task-description">{activeTask.description?.substring(0, 100)}...</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          columnId={selectedColumn}
          availableColumns={columns}
          onSave={handleTaskSave}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setSelectedColumn(null);
          }}
        />
      )}
    </div>
  );
};

// Enhanced Task Modal component with all fields including assignment history
const TaskModal = ({ task, columnId, availableColumns, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.substring(0, 10) : '');
  const [timeEstimate, setTimeEstimate] = useState(task?.time_estimate || '');
  const [status, setStatus] = useState(task?.status || columnId || 'backlog');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const MAX_TITLE_LENGTH = 255;

  const modalColumns = availableColumns?.length > 0 
    ? availableColumns 
    : [
        { id: 'backlog', title: 'Backlog' },
        { id: 'todo', title: 'To Do' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'in_review', title: 'In Review' },
        { id: 'testing', title: 'Testing' },
        { id: 'done', title: 'Done' },
        { id: 'archived', title: 'Archived' },
      ];

  useEffect(() => {
    const loadTaskModalData = async () => {
      // Fetch users
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('access_token');
        const response = await authAPI.getUsers(token);
        setUsers(response || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }

      // Fetch history if editing
      if (task?.id) {
        try {
          setLoadingHistory(true);
          const token = localStorage.getItem('access_token');
          const response = await assignmentAPI.getHistory(task.id, token);
          setAssignmentHistory(response || []);
        } catch (error) {
          console.error('Error fetching assignment history:', error);
        } finally {
          setLoadingHistory(false);
        }
      }
    };

    loadTaskModalData();
  }, [task]);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters (currently ${value.length})`);
    } else {
      setTitleError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters (currently ${trimmedTitle.length})`);
      return;
    }

    const taskData = {
      title: trimmedTitle,
      description,
      priority,
      status,
      assignee_id: assigneeId ? parseInt(assigneeId) : null,
      due_date: dueDate || null,
      time_estimate: timeEstimate || null,
    };

    try {
      setSaving(true);
      await onSave(taskData);
    } catch (error) {
      setSubmitError(error.message || 'Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content task-modal">
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
        {submitError && (
          <div className="error-message">{submitError}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                maxLength={300}
                placeholder="Enter task title"
                className={titleError ? 'input-error' : ''}
                autoFocus={!task}
              />
              <div className="title-input-footer">
                {titleError && <small className="field-error">{titleError}</small>}
                <small className={`char-counter ${title.length > MAX_TITLE_LENGTH ? 'char-over' : title.length > MAX_TITLE_LENGTH * 0.9 ? 'char-warn' : ''}`}>
                  {title.length}/{MAX_TITLE_LENGTH}
                </small>
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {modalColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.title || col.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Describe the task details..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.username})
                  </option>
                ))}
              </select>
              {loadingUsers && <small>Loading users...</small>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Time Estimate (hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          {/* Assignment History Section - Only shown when editing existing task */}
          {task && (
            <div className="assignment-history-section">
              <h3>Assignment History</h3>
              {loadingHistory ? (
                <p>Loading history...</p>
              ) : assignmentHistory.length === 0 ? (
                <p className="no-history">No assignment history yet.</p>
              ) : (
                <div className="history-list">
                  {assignmentHistory.map((record, index) => (
                    <div key={index} className="history-record">
                      <div className="history-timestamp">
                        {new Date(record.changed_at).toLocaleString()}
                      </div>
                      <div className="history-change">
                        <span className="old-assignee">
                          {record.old_assignee
                            ? `${record.old_assignee.first_name} ${record.old_assignee.last_name}`
                            : 'Unassigned'}
                        </span>
                        <span className="history-arrow"> → </span>
                        <span className="new-assignee">
                          {record.new_assignee
                            ? `${record.new_assignee.first_name} ${record.new_assignee.last_name}`
                            : 'Unassigned'}
                        </span>
                      </div>
                      <div className="history-changed-by">
                        Changed by: {record.changed_by?.first_name} {record.changed_by?.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !!titleError}>
              {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Time Log Modal Component
const TimeLogModal = ({ task, logs, loading, onSave, onClose }) => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hours || parseFloat(hours) <= 0) {
      alert('Please enter valid hours');
      return;
    }
    onSave({
      hours: parseFloat(hours),
      description,
    });
    setHours('');
    setDescription('');
  };

  const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content time-log-modal">
        <h2>Time Logs for: {task?.title}</h2>
        
        <div className="time-log-summary">
          <h3>Total Logged: {totalHours.toFixed(1)} hours</h3>
        </div>

        <div className="time-log-form">
          <h3>Add Time Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Hours</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="What did you work on?"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn-primary">
                Log Time
              </button>
            </div>
          </form>
        </div>

        <div className="time-log-list">
          <h3>Previous Entries</h3>
          {loading ? (
            <p>Loading time logs...</p>
          ) : logs.length === 0 ? (
            <p className="no-logs">No time logs yet.</p>
          ) : (
            <div className="logs-table">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <div className="log-date">
                    {new Date(log.logged_at).toLocaleDateString()}
                  </div>
                  <div className="log-hours">{log.hours.toFixed(1)} hours</div>
                  <div className="log-description">{log.description || 'No description'}</div>
                  <div className="log-user">
                    {log.user?.first_name} {log.user?.last_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;