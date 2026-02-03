const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { createCalendarEvent } = require('../services/calendarService');

// @route   GET api/tasks
// @desc    Get all user tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ executeTime: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tasks
// @desc    Create a task
router.post('/', auth, async (req, res) => {
  const { title, type, executeTime, emailTo, phone, attendees, description, senderEmail, senderPassword } = req.body;
  try {
    const newTask = new Task({
      user: req.user.id,
      title,
      type,
      executeTime,
      emailTo,
      description,
      phone,
      attendees,
      senderEmail,
      senderPassword
    });
    const task = await newTask.save();

    // Sync with Google Calendar
    if (type === 'REMINDER' || type === 'MEETING') {
      try {
        const user = await User.findById(req.user.id);
        if (user && user.googleTokens) {
          await createCalendarEvent(task, user.googleTokens); 
          console.log(`Successfully synced ${type} to Google Calendar.`);
        }
      } catch (calErr) {
        console.error('Calendar sync failed:', calErr);
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
