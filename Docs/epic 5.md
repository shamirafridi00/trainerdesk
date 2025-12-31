# EPIC 5: Notification System (Sprint 5 - Weeks 11-13)

## Epic Overview

Build the complete notification system integrating Resend (email) and Twilio (SMS) for automated and manual communications. This includes template management, variable substitution, scheduled reminders, delivery tracking, and credit usage monitoring. Based on our technical documentation, this system is critical for client engagement and trainer workflow automation.[1][2]

---

### Iteration 5.1: Resend Email Integration

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to send confirmation emails to clients so that they have booking details
- As a developer, I need to integrate Resend so that emails can be delivered reliably
- As a trainer, I want to track email delivery so that I know clients received notifications

**Technical Tasks**:

1. Install Resend SDK: `npm install resend`

2. Create Resend configuration: `lib/resend.ts`

   ```typescript
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export default resend;
   ```

3. Add environment variables to `.env.local`:
   - `RESEND_API_KEY` (from Resend dashboard)
   - `RESEND_FROM_EMAIL` (verified sender email)

4. Set up Resend domain verification:
   - Add domain in Resend dashboard
   - Configure DNS records (SPF, DKIM)
   - Verify domain status
   - Document process in help articles

5. Create email sending utility: `lib/email.ts`

   ```typescript
   export async function sendEmail({
     to,
     subject,
     html,
     replyTo,
   }: EmailParams) {
     try {
       const result = await resend.emails.send({
         from: process.env.RESEND_FROM_EMAIL,
         to,
         subject,
         html,
         replyTo,
       });

       // Log to NotificationLog
       await prisma.notificationLog.create({
         data: {
           clientEmail: to,
           type: 'EMAIL',
           status: 'sent',
           provider: 'resend',
           sentAt: new Date(),
         },
       });

       return result;
     } catch (error) {
       // Handle and log error
     }
   }
   ```

6. Create booking confirmation email API: `app/api/notifications/booking-confirmation/route.ts`
   - POST endpoint accepting bookingId
   - Fetch booking details with client and trainer info
   - Render email template with data
   - Send via Resend
   - Return delivery status

7. Build HTML email templates using React:
   - Install React Email: `npm install @react-email/components`
   - Create template: `emails/booking-confirmation.tsx`
   - Use components: Container, Section, Text, Button, Hr
   - Responsive design with inline styles
   - TrainerDesk branding (removable for Enterprise)

8. Implement email rendering:

   ```typescript
   import { render } from '@react-email/render';
   import BookingConfirmation from '@/emails/booking-confirmation';

   const html = render(<BookingConfirmation booking={bookingData} />);
   ```

**Acceptance Criteria**:

- Resend API key configured and working
- Domain verified with green status in Resend dashboard
- Booking confirmation emails sent successfully
- Email templates render correctly across major email clients (Gmail, Outlook, Apple Mail)
- Delivery logged in NotificationLog table
- Failed sends handled with retry logic
- Trainer's reply-to email used for client responses

---

### Iteration 5.2: Twilio SMS Integration

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to send SMS reminders so that clients don't miss sessions
- As a trainer, I want to track SMS usage so that I don't exceed my credit limit
- As a client, I want text confirmations so that I have booking info on my phone

**Technical Tasks**:

1. Install Twilio SDK: `npm install twilio`

2. Create Twilio configuration: `lib/twilio.ts`

   ```typescript
   import twilio from 'twilio';

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   export default client;
   ```

3. Add environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (purchased Twilio number)

4. Purchase Twilio phone number:
   - Document process in setup guide
   - Recommend local numbers for better delivery rates
   - Enable SMS capability

5. Create SMS sending utility: `lib/sms.ts`

   ```typescript
   export async function sendSMS({ to, message, trainerId }: SMSParams) {
     // Check trainer SMS credits
     const trainer = await prisma.trainer.findUnique({
       where: { id: trainerId },
       select: { smsCredits: true },
     });

     if (trainer.smsCredits < 1) {
       throw new Error('Insufficient SMS credits');
     }

     try {
       const result = await twilioClient.messages.create({
         body: message,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: to,
       });

       // Deduct credit and log
       await prisma.$transaction([
         prisma.trainer.update({
           where: { id: trainerId },
           data: { smsCredits: { decrement: 1 } },
         }),
         prisma.notificationLog.create({
           data: {
             clientPhone: to,
             type: 'SMS',
             status: 'sent',
             provider: 'twilio',
             sentAt: new Date(),
           },
         }),
       ]);

       return result;
     } catch (error) {
       // Handle error
     }
   }
   ```

6. Implement SMS character counting:
   - Create utility function to count GSM-7 vs Unicode characters
   - Calculate credit cost (160 chars = 1 credit, 306 = 2 credits)
   - Display character count in template editor

7. Add low credit warnings:
   - Dashboard widget showing remaining SMS/email credits
   - Alert when credits < 10% of monthly allocation
   - Email notification to trainer when depleted
   - Upgrade prompt for additional credits

8. Create SMS delivery webhook: `app/api/webhooks/twilio/route.ts`
   - Endpoint for Twilio status callbacks
   - Update NotificationLog with delivery status
   - Handle failed deliveries

**Acceptance Criteria**:

- Twilio account configured with purchased phone number
- SMS sent successfully to valid phone numbers
- Character counting accurate for credit calculation
- SMS credits decremented after successful send
- Delivery status tracked via webhooks
- Low credit warnings displayed in dashboard
- International numbers supported (with appropriate pricing)
- Failed sends don't deduct credits

---

### Iteration 5.3: Notification Template Management

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to create custom email templates so that communications match my brand
- As a trainer, I want to insert variables so that messages are personalized
- As a trainer, I want separate SMS and email templates so that I optimize for each channel

**Technical Tasks**:

1. Create templates page: `app/(dashboard)/notifications/page.tsx`
   - List of all notification templates
   - Categories: Booking Confirmations, Reminders, Cancellations, Custom
   - Each template shows: name, type (email/SMS/both), last edited, active status
   - "Create Template" button
   - Quick edit and duplicate actions

2. Build template editor: `app/(dashboard)/notifications/[templateId]/page.tsx`
   - Template name input
   - Type selector (Email Only, SMS Only, Both)
   - Subject line (email only)
   - Message body textarea with rich text for email
   - Variable insertion buttons above editor
   - Preview panel showing rendered output
   - Active/inactive toggle
   - Save and test buttons

3. Implement variable system:
   - Available variables: `{client_name}`, `{trainer_name}`, `{business_name}`, `{session_date}`, `{session_time}`, `{session_duration}`, `{booking_link}`, `{reschedule_link}`, `{cancel_link}`, `{trainer_phone}`, `{trainer_email}`
   - Clicking variable button inserts at cursor position
   - Syntax highlighting for variables in editor
   - Preview replaces variables with sample data

4. Create variable replacement utility: `lib/notifications/variables.ts`

   ```typescript
   export function replaceVariables(
     template: string,
     data: BookingData
   ): string {
     return template
       .replace('{client_name}', data.client.name)
       .replace('{trainer_name}', data.trainer.name)
       .replace('{session_date}', formatDate(data.startTime))
       .replace('{session_time}', formatTime(data.startTime));
     // ... other replacements
   }
   ```

5. Build template preview component: `components/notifications/preview-panel.tsx`
   - Shows rendered email/SMS with sample data
   - Switches between email and SMS view if template supports both
   - Character counter for SMS
   - Email preview using iframe for styling

6. Create default templates:
   - Seed database with 5 default templates:
     1. Booking Confirmation (Email + SMS)
     2. 24-Hour Reminder (Email + SMS)
     3. 2-Hour Reminder (SMS only)
     4. Cancellation Notice (Email + SMS)
     5. Rescheduling Confirmation (Email)
   - Mark defaults as system templates (non-deletable)

7. Implement template CRUD API: `app/api/notifications/templates/route.ts`
   - GET: List all templates for trainer
   - POST: Create new template with validation
   - PATCH: Update template
   - DELETE: Delete custom templates (not system defaults)

8. Add template testing:
   - "Send Test" button in editor
   - Modal asking for test email/phone
   - Sends template with sample data
   - Shows delivery confirmation or error

**Acceptance Criteria**:

- Template editor displays all fields correctly
- Variables insert at cursor position
- Preview accurately renders template with sample data
- Character counter updates in real-time for SMS
- Test emails/SMS deliver successfully
- Templates save and persist in database
- System templates cannot be deleted
- Both email and SMS templates supported in single template

---

### Iteration 5.4: Automated Reminder System

**Duration**: 4 days

**User Stories**:

- As a trainer, I want to configure when reminders are sent so that clients don't forget sessions
- As a client, I want to receive reminders before my session so that I don't miss it
- As a trainer, I want reminders sent automatically so that I don't have to manually notify clients

**Technical Tasks**:

1. Create reminder settings page: `app/(dashboard)/settings/reminders/page.tsx`
   - Checkbox grid: 24hr (Email/SMS), 2hr (Email/SMS), 1hr (Email/SMS)
   - Toggle to enable/disable entire reminder system
   - Template selector for each reminder type
   - Pro/Enterprise badge for advanced timing options
   - Preview of reminder schedule for sample booking

2. Store reminder preferences:
   - Add `reminderSettings` JSON field to Trainer model
   - Structure:

   ```typescript
   {
     enabled: boolean,
     reminders: [
       { timing: 24, email: true, sms: false, templateId: 'xxx' },
       { timing: 2, email: true, sms: true, templateId: 'yyy' }
     ]
   }
   ```

3. Create cron job endpoint: `app/api/cron/send-reminders/route.ts`
   - Protected endpoint (verify Vercel cron secret)
   - Query bookings with `startTime` between now and 24 hours from now
   - Check if reminder already sent (add `remindersSent` JSON to Booking)
   - For each booking, check trainer's reminder settings
   - Send appropriate notifications
   - Mark reminder as sent in booking record

4. Configure Vercel cron job in `vercel.json`:

   ```json
   {
     "crons": [
       {
         "path": "/api/cron/send-reminders",
         "schedule": "*/15 * * * *"
       }
     ]
   }
   ```

5. Implement reminder logic: `lib/notifications/reminders.ts`

   ```typescript
   export async function processReminders() {
     const now = new Date();
     const next24hrs = addHours(now, 24);

     const bookings = await prisma.booking.findMany({
       where: {
         startTime: { gte: now, lte: next24hrs },
         status: 'CONFIRMED',
       },
       include: { trainer: true, client: true },
     });

     for (const booking of bookings) {
       const reminderSettings = booking.trainer.reminderSettings;
       const remindersSent = booking.remindersSent || [];

       for (const reminder of reminderSettings.reminders) {
         const sendTime = subHours(booking.startTime, reminder.timing);

         if (
           isAfter(now, sendTime) &&
           !remindersSent.includes(reminder.timing)
         ) {
           // Send notification
           await sendReminder(booking, reminder);

           // Mark as sent
           await prisma.booking.update({
             where: { id: booking.id },
             data: {
               remindersSent: [...remindersSent, reminder.timing],
             },
           });
         }
       }
     }
   }
   ```

6. Create immediate confirmation notifications:
   - Hook into booking creation API from EPIC 3
   - After successful booking, send confirmation email/SMS
   - Use trainer's confirmation template
   - Include booking details and action links

7. Add notification to reschedule/cancel flows:
   - Trigger notifications when booking rescheduled
   - Send cancellation notice when booking cancelled
   - Use appropriate templates from trainer's settings

8. Implement retry logic:
   - If send fails, retry up to 3 times with exponential backoff
   - Log failures in NotificationLog
   - Alert trainer dashboard if critical notification fails

**Acceptance Criteria**:

- Cron job runs every 15 minutes without errors
- Reminders sent at configured times (24hr, 2hr before sessions)
- Same reminder not sent multiple times to client
- Booking confirmations sent immediately after creation
- Cancellation/rescheduling notifications trigger correctly
- Failed notifications logged and retried
- Trainer can enable/disable specific reminder types
- Free tier users have access to basic reminders (24hr only)
- Pro/Enterprise users access all reminder timing options

---

### Iteration 5.5: Notification History & Tracking

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to see notification history so that I know what was sent to clients
- As a trainer, I want to see delivery status so that I know if notifications failed
- As a trainer, I want to resend notifications if they failed so that clients receive important information

**Technical Tasks**:

1. Create notification history page: `app/(dashboard)/notifications/history/page.tsx`
   - Table with columns: Date, Client, Type (Email/SMS), Template, Status, Actions
   - Status badges: Sent (blue), Delivered (green), Failed (red), Bounced (orange)
   - Filters: Date range, type, status
   - Search by client name/email/phone
   - Export to CSV button

2. Build notification detail modal: `components/notifications/notification-detail-modal.tsx`
   - Shows complete notification data
   - Rendered message content
   - Delivery timestamps
   - Error message if failed
   - Resend button

3. Create notification history API: `app/api/notifications/history/route.ts`
   - GET endpoint with pagination
   - Query NotificationLog with filters
   - Join with booking/client data
   - Return formatted results

4. Implement delivery status webhook handling:
   - Resend webhook: `app/api/webhooks/resend/route.ts`
   - Twilio webhook: `app/api/webhooks/twilio/route.ts` (enhance existing)
   - Update NotificationLog status: sent → delivered/failed/bounced
   - Handle various status codes from providers

5. Add resend functionality:
   - API endpoint: `app/api/notifications/[logId]/resend/route.ts`
   - Fetch original notification data
   - Re-send using same template and data
   - Create new NotificationLog entry
   - Deduct credits if SMS

6. Create notification analytics widget:
   - Dashboard card showing: Total sent (this month), Delivery rate, Failed count
   - Click-through to full history page
   - Alert badge if failures exceed threshold

7. Implement bulk resend:
   - Checkbox selection in history table
   - "Resend Selected" button
   - Confirmation modal with credit cost (for SMS)
   - Background job for large batches

**Acceptance Criteria**:

- Notification history displays all sent notifications
- Filters and search work correctly
- Delivery status updates from webhooks
- Failed notifications can be resent successfully
- Resending increments usage counts appropriately
- Analytics widget shows accurate statistics
- Bulk resend processes multiple notifications
- Export generates CSV with complete data

---

### Iteration 5.6: Credit Management & Usage Limits

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to see my remaining credits so that I know when to upgrade
- As a Free tier trainer, I want to be notified when credits are low so that I can upgrade
- As a Pro trainer, I want to purchase additional credits so that I don't run out mid-month

**Technical Tasks**:

1. Create usage dashboard: `app/(dashboard)/settings/usage/page.tsx`
   - Progress bars for SMS and email credits
   - Used vs Remaining display
   - Reset date (monthly cycle)
   - Usage history chart (last 6 months)
   - Purchase additional credits button (Pro/Enterprise)

2. Build credit tracking system:
   - Current month usage calculation
   - Reset on subscription renewal date
   - Historical usage storage (aggregate by month)

3. Implement low credit warnings:
   - Check credits before sending notification
   - Show warning modal when < 10% remaining
   - Email notification at 50%, 25%, 10%, 0%
   - Dashboard banner when depleted

4. Create credit purchase flow (Pro/Enterprise):
   - "Buy More Credits" modal with packages
   - SMS: 100 credits ($5), 500 ($20), 1000 ($35)
   - Email: 500 credits ($10), 2000 ($30), 5000 ($60)
   - Paddle Checkout for payment
   - Instant credit addition after payment

5. Add credit purchase API: `app/api/subscriptions/purchase-credits/route.ts`
   - Create Paddle transaction
   - Webhook handler for successful payment
   - Increment trainer credits
   - Send confirmation email

6. Implement notification blocking:
   - If credits depleted, block automatic reminders
   - Queue notifications for manual review
   - Dashboard alert: "Reminders paused - No credits remaining"
   - Allow manual sends with upgrade prompt

7. Add usage analytics:
   - API endpoint: `app/api/analytics/usage/route.ts`
   - Aggregate NotificationLog by month
   - Calculate average daily usage
   - Predict when credits will be depleted
   - Recommend appropriate tier upgrade

8. Create credit reset job: `app/api/cron/reset-credits/route.ts`
   - Runs monthly on subscription renewal date
   - Resets credits to tier allocation
   - Archives previous month's usage
   - Sends monthly usage report email

**Acceptance Criteria**:

- Usage dashboard displays accurate credit counts
- Credits decrement correctly after sending
- Low credit warnings trigger at appropriate thresholds
- Credit purchases process successfully via Paddle
- Purchased credits added immediately to account
- Notification sending blocked when credits depleted
- Monthly credit reset works correctly
- Usage analytics provide actionable insights

---

### Iteration 5.7: Testing & Optimization

**Duration**: 2 days

**Technical Tasks**:

1. Email deliverability testing:
   - Test with major providers (Gmail, Outlook, Yahoo, Apple)
   - Check spam folder placement
   - Verify SPF/DKIM authentication
   - Test with Mail Tester (aim for 10/10 score)

2. SMS delivery testing:
   - Test with major carriers (AT&T, Verizon, T-Mobile)
   - Verify international number support
   - Check delivery times
   - Test opt-out handling (STOP keyword)

3. Performance optimization:
   - Batch notification sending (50 per batch)
   - Rate limiting to respect provider limits
   - Queue system for large sends (Bull or Inngest)
   - Database indexing for NotificationLog queries

4. Error handling improvements:
   - Graceful degradation if provider unavailable
   - Detailed error messages for troubleshooting
   - Automatic retry with exponential backoff
   - Alert system for systematic failures

5. Load testing:
   - Simulate 1000 bookings needing reminders
   - Verify cron job completes within time limit
   - Check database performance under load
   - Optimize slow queries

6. User acceptance testing:
   - End-to-end test of booking → confirmation → reminders
   - Test template customization flow
   - Verify credit tracking accuracy
   - Test on multiple devices and browsers

**Acceptance Criteria**:

- Email deliverability rate >95%
- SMS delivery rate >98%
- Cron job processes 1000 notifications in <5 minutes
- No memory leaks or timeouts
- All error scenarios handled gracefully
- User testing reveals no critical issues

---

## EPIC 5 Completion Criteria

By the end of this epic, TrainerDesk will have a complete notification system with:

- ✅ Resend email integration with verified domain
- ✅ Twilio SMS integration with credit tracking
- ✅ Template management with variable substitution
- ✅ Automated reminder system (24hr, 2hr, 1hr)
- ✅ Notification history and delivery tracking
- ✅ Credit management with purchase options
- ✅ Comprehensive testing and optimization

**Next Epic Preview**: EPIC 6 will implement Subscription & Billing with Paddle integration, including tier management, upgrade/downgrade flows, feature gating, and webhook handling for subscription lifecycle events.

---

This completes EPIC 5 with detailed iterations covering approximately 3 weeks of development work. The notification system significantly enhances TrainerDesk's value by automating client communications and reducing no-show rates through timely reminders.
