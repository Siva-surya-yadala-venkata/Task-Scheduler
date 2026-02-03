const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');
const { google } = require('googleapis');

// Default system transporter (Fallback)
const systemTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const initScheduler = () => {
  // Check for pending tasks every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking for pending tasks...');
    const now = new Date();

    try {
      // 1. Handle Email & Meeting Notification Tasks
      const pendingEmailTasks = await Task.find({
        type: { $in: ['EMAIL', 'MEETING'] },
        status: 'PENDING',
        executeTime: { $lte: now }
      });

      for (const task of pendingEmailTasks) {
        let sent = false;
        const recipients = task.type === 'MEETING' && task.attendees?.length > 0 
          ? task.attendees.join(', ') 
          : task.emailTo;

        if (!recipients) {
          console.log(`⚠️ No recipients found for ${task.type} task: ${task.title}`);
          task.status = 'FAILED';
          await task.save();
          continue;
        }

        // --- STEP A: Try User's Manual SMTP Credentials (if provided) ---
        if (task.senderEmail && task.senderPassword) {
          try {
            console.log(`\n📧 Attempting SMTP send from: ${task.senderEmail} to: ${recipients}`);
            const userTransporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: task.senderEmail,
                pass: task.senderPassword
              }
            });
            await userTransporter.sendMail({
              from: task.senderEmail,
              to: recipients,
              subject: task.title,
              text: task.description || `Scheduled ${task.type.toLowerCase()}: ${task.title}`
            });
            console.log(`✅ Email sent successfully via User SMTP!`);
            sent = true;
          } catch (smtpErr) {
            console.error(`❌ User SMTP failed:`, smtpErr.message);
          }
        }

        // --- STEP B: Try OAuth Delegation (if no manual SMTP or if it failed) ---
        if (!sent) {
          try {
            const user = await User.findById(task.user);
            if (user && user.googleTokens && user.googleTokens.scope?.includes('gmail.send')) {
              console.log(`⏳ Attempting OAuth send for: ${user.email} to: ${recipients}`);
              const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
              );
              oauth2Client.setCredentials(user.googleTokens);
              const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

              const utf8Subject = `=?utf-8?B?${Buffer.from(task.title).toString('base64')}?=`;
              const messageParts = [
                `From: ${user.email}`,
                `To: ${recipients}`,
                `Content-Type: text/plain; charset=utf-8`,
                `MIME-Version: 1.0`,
                `Subject: ${utf8Subject}`,
                '',
                task.description || `Scheduled ${task.type.toLowerCase()}: ${task.title}`
              ];
              const message = messageParts.join('\r\n');
              const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

              const res = await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: encodedMessage }
              });
              console.log(`✅ Email sent via User OAuth! Message ID: ${res.data.id}`);
              sent = true;
            }
          } catch (oauthErr) {
            console.error(`❌ User OAuth failed:`, oauthErr.message);
          }
        }

        // --- STEP C: Fallback to System Email ---
        if (!sent) {
          try {
            console.log(`⚠️ Falling back to system email for: ${recipients}...`);
            await systemTransporter.sendMail({
              from: process.env.EMAIL_USER,
              to: recipients,
              subject: task.title,
              text: task.description || `Scheduled ${task.type.toLowerCase()}: ${task.title}`
            });
            console.log(`✅ Email sent via System Fallback!`);
            sent = true;
          } catch (sysErr) {
            console.error(`❌ System fallback failed:`, sysErr.message);
          }
        }

        if (sent) {
          task.status = 'COMPLETED';
        } else {
          task.status = 'FAILED';
        }
        await task.save();
      }

      // 2. Handle SMS Reminders (Simulated)
      const pendingSmsTasks = await Task.find({
        type: 'REMINDER',
        status: 'PENDING',
        phone: { $exists: true, $ne: '' },
        executeTime: { $lte: now }
      });

      for (const task of pendingSmsTasks) {
        console.log(`\n--- SMS SENT ---`);
        console.log(`To: ${task.phone}`);
        console.log(`Message: ${task.description || `Reminder: ${task.title}`}`);
        console.log(`----------------\n`);
        task.status = 'COMPLETED';
        await task.save();
      }

    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });
};

module.exports = initScheduler;
