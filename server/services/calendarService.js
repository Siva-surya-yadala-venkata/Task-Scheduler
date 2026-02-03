const { google } = require('googleapis');

const createCalendarEvent = async (task, tokens) => {
  console.log(`\n--- STARTING CALENDAR SYNC for: "${task.title}" ---`);
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startTime = new Date(task.executeTime);
  const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration

  const event = {
    summary: task.title,
    description: task.description || `Task Scheduler Reminder\nType: ${task.type}\nPhone: ${task.phone || 'N/A'}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  if (task.type === 'MEETING' && task.attendees) {
    event.attendees = task.attendees.map(email => ({ email }));
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'all',
      resource: event,
    });
    console.log(`✅ GOOGLE CALENDAR EVENT CREATED: ${response.data.htmlLink}`);
    return response.data;
  } catch (error) {
    console.error('❌ GOOGLE CALENDAR ERROR:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { createCalendarEvent };
