import React from 'react';

const TaskList = ({ tasks, onDelete }) => {
  return (
    <div className="dashboard-grid">
      {tasks.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found.</p>}
      {tasks.map(task => (
        <div key={task._id} className={`card task-card ${task.type}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>{task.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {new Date(task.executeTime).toLocaleString()}
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '1rem', 
                  backgroundColor: 'var(--bg)',
                  textTransform: 'capitalize'
                }}>
                  {task.type.toLowerCase()}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  marginLeft: '0.5rem',
                  color: task.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-muted)'
                }}>
                  ● {task.status}
                </span>
                {task.imminent && task.status === 'PENDING' && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    marginLeft: '0.5rem',
                    color: '#f59e0b',
                    fontWeight: 'bold',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    ⌛ Nearly to the time
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => onDelete(task._id)}
              style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
