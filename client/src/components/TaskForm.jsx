import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'REMINDER',
    executeTime: '',
    emailTo: '',
    phone: '',
    attendees: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = { ...formData, attendees: formData.attendees.split(',').map(s => s.trim()).filter(s => s) };
    
    try {
      const res = await axios.post('http://localhost:5000/api/tasks', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onTaskCreated(res.data);
      setFormData({ title: '', type: 'REMINDER', executeTime: '', emailTo: '', phone: '', attendees: '', description: '' });
    } catch (err) {
      console.error('Failed to create task', err);
      // Fallback: Save offline if error (e.g. offline)
      if (!window.navigator.onLine) {
        alert('Offline! Task will be synced later.');
      }
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Type</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="REMINDER">Reminder</option>
            <option value="MEETING">Meeting</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        <div className="input-group">
          <label>Scheduled Time</label>
          <input 
            type="datetime-local" 
            value={formData.executeTime} 
            onChange={e => setFormData({...formData, executeTime: e.target.value})} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Message / Description</label>
          <textarea 
            className="form-control"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="What should the message say?"
            rows="3"
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: 'white',
              marginTop: '0.5rem'
            }}
          />
        </div>
        {formData.type === 'EMAIL' && (
          <>
            <div className="input-group">
              <label>Your Gmail (Sender)</label>
              <input 
                type="email" 
                value={formData.senderEmail} 
                onChange={e => setFormData({...formData, senderEmail: e.target.value})} 
                required 
                placeholder="Your gmail address"
              />
            </div>
            <div className="input-group">
              <label>App Password (Sender)</label>
              <input 
                type="password" 
                value={formData.senderPassword} 
                onChange={e => setFormData({...formData, senderPassword: e.target.value})} 
                required 
                placeholder="16-character app password"
              />
            </div>
            <div className="input-group">
              <label>Recipient Email</label>
              <input 
                type="email" 
                value={formData.emailTo} 
                onChange={e => setFormData({...formData, emailTo: e.target.value})} 
                required 
              />
            </div>
          </>
        )}
        {formData.type === 'REMINDER' && (
          <div className="input-group">
            <label>Phone Number (for SMS reminder)</label>
            <input 
              type="tel" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              placeholder="e.g. +1234567890"
            />
          </div>
        )}
        {formData.type === 'MEETING' && (
          <div className="input-group">
            <label>Attendees (comma separated)</label>
            <input 
              type="text" 
              value={formData.attendees} 
              onChange={e => setFormData({...formData, attendees: e.target.value})} 
              placeholder="email1@test.com, email2@test.com"
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Schedule Task</button>
      </form>
    </div>
  );
};

export default TaskForm;
