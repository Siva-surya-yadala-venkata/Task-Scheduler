import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './components/Auth';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { getTasksOffline, saveTasksOffline } from './utils/db';

const API_BASE = 'http://localhost:5000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkDueTasks();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const checkDueTasks = () => {
    const now = new Date();
    let hasUpdates = false;
    const updatedTasks = tasks.map(task => {
      if (task.status === 'PENDING') {
        const taskTime = new Date(task.executeTime);
        const diff = taskTime.getTime() - now.getTime();
        
        // Mark as "IMMINENT" locally if due in next 5 mins
        if (diff > 0 && diff <= 300000) {
          return { ...task, imminent: true };
        }

        // If task is due now, show notification but don't force COMPLETE locally
        // unless we want instant gratification (which might mismatch the server if it fails)
        if (diff <= 0 && diff > -60000 && task.status === 'PENDING') {
          showNotification(task);
          // Let the server scheduler handle the official completion status
        }
      }
      return task;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      setTasks(updatedTasks);
    }
  };

  const showNotification = (task) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Task Scheduler: Ready!", {
        body: `Your task "${task.title}" is due now!`,
        icon: "/vite.svg"
      });
    }
    // We don't alert here to avoid blocking execution, the status change is enough
    console.log(`TASK READY: ${task.title}`);
  };

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(window.navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    if (window.navigator.onLine) {
      try {
        const res = await axios.get(`${API_BASE}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
        saveTasksOffline(res.data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
        const cached = await getTasksOffline();
        setTasks(cached);
      }
    } else {
      const cached = await getTasksOffline();
      setTasks(cached);
    }
  };

  const handleLogin = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  };

  const handleConnectCalendar = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/calendar/auth`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert('Failed to get calendar auth URL');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Task Scheduler</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isOnline && <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>Offline Mode</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={handleConnectCalendar} className="btn btn-primary" style={{ backgroundColor: '#4285F4' }}>
              Connect Google Calendar
            </button>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Authorized via Google OAuth (Secure)
            </span>
          </div>
          <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--card-bg)' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem', alignItems: 'start' }}>
        <TaskForm onTaskCreated={(newTask) => setTasks([newTask, ...tasks])} />
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Your Schedule</h2>
          <TaskList tasks={tasks} onDelete={deleteTask} />
        </div>
      </div>
    </div>
  );
}

export default App;
