# EPIC 6: Subscription & Billing (Sprint 6 - Weeks 14-16)

## Epic Overview

Implement the complete subscription and billing system using Paddle as the merchant of record. This epic covers tier management, checkout flows, upgrade/downgrade processes, feature gating, webhook handling for subscription lifecycle events, and billing portal integration. The three-tier system (Free, Pro $14/month, Enterprise $49/month) will be fully operational with automatic feature provisioning.[1][2]

---

### Iteration 6.1: Paddle Integration & Configuration

**Duration**: 3 days

**User Stories**:

- As a developer, I need to integrate Paddle so that we can accept subscription payments
- As a trainer, I want secure payment processing so that my billing information is protected
- As TrainerDesk, I want Paddle to handle tax compliance so that we don't manage VAT/sales tax

**Technical Tasks**:

1. Install Paddle SDK: `npm install @paddle/paddle-js`

2. Create Paddle account and configuration:
   - Sign up for Paddle account (Sandbox for development)
   - Create product catalog with 3 subscription plans
   - Configure webhook endpoints
   - Obtain API keys and vendor ID

3. Set up Paddle products in dashboard:
   - **Free Tier**: $0/month (no Paddle product needed)
   - **Pro Tier**: $14/month recurring, 500 SMS, 500 emails, 2 sub-trainers
   - **Enterprise Tier**: $49/month recurring, unlimited everything
   - Add-ons: Additional SMS credits, Additional email credits, Extra sub-trainer seats

4. Create Paddle configuration: `lib/paddle.ts`

   ```typescript
   import { Paddle } from '@paddle/paddle-js';

   export const initializePaddle = () => {
     return Paddle.Setup({
       vendor: parseInt(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID!),
       eventCallback: function (data) {
         // Handle Paddle events
       },
     });
   };

   export const PADDLE_PLANS = {
     PRO: process.env.NEXT_PUBLIC_PADDLE_PRO_PLAN_ID,
     ENTERPRISE: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PLAN_ID,
   };
   ```

5. Add environment variables:
   - `NEXT_PUBLIC_PADDLE_VENDOR_ID` (public)
   - `NEXT_PUBLIC_PADDLE_PRO_PLAN_ID` (public)
   - `NEXT_PUBLIC_PADDLE_ENTERPRISE_PLAN_ID` (public)
   - `PADDLE_API_KEY` (secret)
   - `PADDLE_PUBLIC_KEY` (for webhook verification)

6. Initialize Paddle in root layout:
   - Load Paddle.js script
   - Initialize on client side only
   - Handle loading states

7. Create subscription constants: `lib/constants/subscriptions.ts`
   ```typescript
   export const SUBSCRIPTION_TIERS = {
     FREE: {
       name: 'Free',
       price: 0,
       features: {
         pages: 1,
         subTrainers: 0,
         smsCredits: 10,
         emailCredits: 50,
         customDomain: false,
         whiteLabel: false,
         advancedWorkflows: false,
         apiAccess: false,
       },
     },
     PRO: {
       name: 'Pro',
       price: 14,
       features: {
         pages: 1,
         subTrainers: 2,
         smsCredits: 500,
         emailCredits: 500,
         customDomain: true,
         whiteLabel: false,
         advancedWorkflows: true,
         apiAccess: false,
       },
     },
     ENTERPRISE: {
       name: 'Enterprise',
       price: 49,
       features: {
         pages: 1,
         subTrainers: -1, // unlimited
         smsCredits: -1, // unlimited
         emailCredits: -1, // unlimited
         customDomain: true,
         whiteLabel: true,
         advancedWorkflows: true,
         apiAccess: true,
       },
     },
   };
   ```

**Acceptance Criteria**:

- Paddle account created with sandbox and production environments
- Product catalog configured with correct pricing
- Paddle.js loads successfully in application
- Environment variables configured
- Subscription tier constants defined and accessible
- Paddle initialization works without errors

---

### Iteration 6.2: Checkout Flow & Subscription Creation

**Duration**: 3 days

**User Stories**:

- As a Free tier trainer, I want to upgrade to Pro so that I can access more features
- As a trainer, I want a smooth checkout experience so that upgrading is easy
- As a trainer, I want to see what I'm paying for so that I make an informed decision

**Technical Tasks**:

1. Create pricing page: `app/(public)/pricing/page.tsx`
   - Three-column layout for tier comparison
   - Feature list with checkmarks/X marks
   - Highlight Pro tier as "Most Popular"
   - "Get Started" buttons for each tier
   - FAQ section below
   - Mobile-responsive stacked layout

2. Build tier comparison table component: `components/shared/tier-comparison-table.tsx`
   - Rows for each feature with tier availability
   - Visual indicators (✓, ✗, "Unlimited")
   - Sticky header on scroll
   - Highlight differences between tiers

3. Create upgrade modal: `components/subscriptions/upgrade-modal.tsx`
   - Shows selected plan details
   - Annual vs Monthly toggle (10% discount for annual)
   - "Continue to Checkout" button
   - Opens Paddle checkout overlay
   - Close and back buttons

4. Implement Paddle Checkout: `lib/paddle-checkout.ts`

   ```typescript
   export function openCheckout(planId: string, email: string, userId: string) {
     Paddle.Checkout.open({
       product: planId,
       email: email,
       passthrough: JSON.stringify({ userId }),
       successCallback: data => {
         // Handle successful subscription
         window.location.href = '/dashboard?upgraded=true';
       },
       closeCallback: () => {
         // Handle checkout closed
       },
     });
   }
   ```

5. Create checkout API endpoint: `app/api/subscriptions/checkout/route.ts`
   - POST: Generate Paddle checkout URL or open overlay
   - Include user email and ID in passthrough data
   - Return checkout URL or handle client-side open

6. Handle post-checkout redirect:
   - Success page: `app/(dashboard)/subscription-success/page.tsx`
   - Display confirmation message
   - Show activated features
   - CTA to explore new features
   - Confetti animation for celebration

7. Implement annual discount logic:
   - Toggle in upgrade modal
   - Calculate savings display
   - Pass annual plan ID to Paddle
   - Store billing cycle preference

**Acceptance Criteria**:

- Pricing page displays all three tiers clearly
- Feature comparison accurate and easy to understand
- Upgrade modal opens from dashboard and pricing page
- Paddle checkout overlay loads successfully
- Successful payment redirects to success page
- User can choose between monthly and annual billing
- Annual discount applied correctly
- Mobile checkout experience is smooth

---

### Iteration 6.3: Webhook Handler & Subscription Sync

**Duration**: 4 days

**User Stories**:

- As the system, I need to receive Paddle webhooks so that subscription status stays synchronized
- As a trainer, I want features activated immediately after payment so that I can use them right away
- As a trainer, I want automatic renewals so that my service isn't interrupted

**Technical Tasks**:

1. Create webhook endpoint: `app/api/webhooks/paddle/route.ts`
   - POST handler for all Paddle webhook events
   - Verify webhook signature using public key
   - Parse event data
   - Route to appropriate handler based on alert_name

2. Implement webhook signature verification:

   ```typescript
   import crypto from 'crypto';

   function verifyPaddleWebhook(body: string, signature: string): boolean {
     const publicKey = process.env.PADDLE_PUBLIC_KEY;

     // Sort fields, serialize, verify signature
     const verifier = crypto.createVerify('sha1');
     verifier.update(body);

     return verifier.verify(publicKey, signature, 'base64');
   }
   ```

3. Handle subscription created event:
   - Event: `subscription_created`
   - Update Trainer record with Paddle customer ID and subscription ID
   - Set `subscriptionTier` to appropriate tier
   - Set `subscriptionStatus` to 'active'
   - Reset monthly credits to tier allocation
   - Send welcome email with feature overview

4. Handle subscription updated event:
   - Event: `subscription_updated`
   - Handle plan changes (upgrades/downgrades)
   - Update tier and features
   - Adjust credits accordingly
   - Send confirmation email

5. Handle subscription cancelled event:
   - Event: `subscription_cancelled`
   - Set `subscriptionStatus` to 'cancelled'
   - Set `subscriptionEndsAt` to end of billing period
   - Keep features active until end date
   - Send cancellation confirmation email

6. Handle subscription payment succeeded event:
   - Event: `subscription_payment_succeeded`
   - Reset monthly credits
   - Update `subscriptionEndsAt` to next billing date
   - Log payment in system
   - Send invoice/receipt email

7. Handle subscription payment failed event:
   - Event: `subscription_payment_failed`
   - Set `subscriptionStatus` to 'past_due'
   - Send payment failed email with update link
   - Grace period of 7 days before downgrade
   - Retry notifications at days 1, 3, 5, 7

8. Create webhook testing utility:
   - Local webhook forwarding with ngrok or Paddle's webhook tester
   - Test script to simulate all webhook events
   - Verify database updates correctly for each event

9. Add webhook logging:
   - Create WebhookLog model in Prisma
   - Log all incoming webhooks
   - Store raw payload for debugging
   - Track processing status and errors

**Acceptance Criteria**:

- Webhook endpoint receives and processes Paddle events
- Signature verification prevents unauthorized requests
- Subscription created activates tier features immediately
- Payment success resets credits correctly
- Failed payments trigger appropriate user notifications
- Cancellation preserves access until period end
- All webhooks logged for audit trail
- Webhook processing completes within 5 seconds

---

### Iteration 6.4: Feature Gating System

**Duration**: 3 days

**User Stories**:

- As a Free tier trainer, I want to see locked features so that I know what's available in paid tiers
- As a Pro trainer, I want full access to Pro features so that I get value from my subscription
- As the system, I need to enforce feature limits so that tier restrictions are respected

**Technical Tasks**:

1. Create feature gate hook: `lib/hooks/use-feature-gate.ts`

   ```typescript
   export function useFeatureGate(feature: string) {
     const { data: subscription } = useSubscription();

     const hasAccess = checkFeatureAccess(subscription.tier, feature);

     return {
       hasAccess,
       tier: subscription.tier,
       showUpgrade: !hasAccess,
     };
   }

   function checkFeatureAccess(tier: string, feature: string): boolean {
     const tierFeatures = SUBSCRIPTION_TIERS[tier].features;
     return tierFeatures[feature] === true || tierFeatures[feature] === -1;
   }
   ```

2. Create feature gate component: `components/shared/feature-gate.tsx`
   - Wraps restricted features
   - Shows locked overlay if no access
   - Displays upgrade badge and CTA
   - Props: feature name, tier required
   - Children render only if access granted

3. Implement in UI components:
   - Sub-trainer management: Gate with "subTrainers" feature
   - Custom domain settings: Gate with "customDomain" feature
   - White-label options: Gate with "whiteLabel" feature
   - Advanced workflows: Gate with "advancedWorkflows" feature

4. Add usage limit enforcement:
   - Check sub-trainer count before adding new
   - Check SMS credits before sending
   - Check email credits before sending
   - Show warning when approaching limits

5. Create upgrade prompts: `components/subscriptions/upgrade-prompt.tsx`
   - Appears when clicking locked feature
   - Shows required tier and pricing
   - "Upgrade Now" button opens checkout
   - "Maybe Later" dismisses modal

6. Implement API-level enforcement:
   - Middleware checks subscription tier
   - Reject requests to restricted endpoints
   - Return 403 Forbidden with upgrade message
   - Example: `POST /api/sub-trainers` checks tier

7. Add visual indicators:
   - "🔒 Pro" badges on locked features in navigation
   - Disabled state with tooltip explaining requirement
   - Hover shows "Upgrade to Pro to unlock"
   - Free tier users see badges throughout interface

8. Create current plan widget: `components/dashboard/current-plan-widget.tsx`
   - Shows active tier with icon
   - Progress bars for credit usage
   - "Manage Subscription" button
   - Upgrade CTA for Free/Pro users

**Acceptance Criteria**:

- Feature gate hook accurately checks access
- Locked features display upgrade prompts
- API endpoints enforce tier restrictions
- Visual indicators clear and consistent
- Usage limits enforced (sub-trainers, credits)
- Upgrade prompts open checkout correctly
- No way to bypass feature gates client-side
- Current plan widget displays accurate information

---

### Iteration 6.5: Upgrade & Downgrade Flows

**Duration**: 3 days

**User Stories**:

- As a Pro trainer, I want to upgrade to Enterprise so that I get unlimited features
- As a trainer, I want to downgrade my plan so that I can reduce costs if needed
- As a trainer, I want proration handled fairly so that I'm not double-charged

**Technical Tasks**:

1. Create billing settings page: `app/(dashboard)/settings/billing/page.tsx`
   - Current plan card with details
   - Plan comparison showing current vs other tiers
   - "Change Plan" buttons for upgrade/downgrade
   - Billing history table
   - Payment method management
   - Cancel subscription button

2. Build upgrade flow:
   - "Upgrade" button opens plan selector
   - Show price difference and proration
   - Paddle handles proration automatically
   - Immediate access to new tier features
   - Confirmation email sent

3. Implement downgrade flow:
   - "Downgrade" button opens confirmation modal
   - Warning about lost features (list specific features)
   - Effective date (end of current billing period vs immediate)
   - Checkbox: "I understand I'll lose access to..."
   - Confirm downgrade button

4. Create plan change API: `app/api/subscriptions/change-plan/route.ts`
   - POST: Accept new plan ID
   - Call Paddle API to update subscription
   - Paddle webhook handles actual tier change
   - Return confirmation

5. Handle immediate vs end-of-period changes:
   - Upgrades: Immediate with prorated charge
   - Downgrades: Two options (immediate or end of period)
   - Store scheduled change in database
   - Cron job applies scheduled changes
   - Email notification before change takes effect

6. Implement feature preservation logic:
   - On downgrade, don't delete data (sub-trainers, templates)
   - Mark as "inactive" but preserve
   - Re-activate if user upgrades again
   - Warn user: "Your 3 sub-trainers will be deactivated"

7. Add cancellation flow:
   - "Cancel Subscription" button (with confirmation)
   - Survey: "Why are you cancelling?" (optional feedback)
   - Retention offer: "How about 20% off for 3 months?" (Optional)
   - Schedule cancellation for end of billing period
   - Confirmation email with reactivation link

8. Create subscription management shortcut:
   - Link to Paddle's customer portal
   - Trainers can update payment method
   - View invoices and billing history
   - Managed by Paddle (less code to maintain)

**Acceptance Criteria**:

- Upgrade process completes successfully with proration
- Downgrade shows clear warnings about lost features
- Immediate downgrades work correctly
- End-of-period changes scheduled and applied automatically
- Cancellation preserves access until period end
- Payment method can be updated via Paddle portal
- All plan changes trigger appropriate webhooks
- Confirmation emails sent for all changes

---

### Iteration 6.6: Invoice Management & Billing History

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to view my invoices so that I have records for accounting
- As a trainer, I want to download invoices so that I can submit for expense reimbursement
- As a trainer, I want to see payment history so that I can track my subscription charges

**Technical Tasks**:

1. Create invoices API: `app/api/subscriptions/invoices/route.ts`
   - GET: Fetch invoices from Paddle API
   - Query by customer ID (from Trainer.paddleCustomerId)
   - Return list of invoices with dates, amounts, status
   - Include download URLs from Paddle

2. Build billing history section: `app/(dashboard)/settings/billing/invoices/page.tsx`
   - Table with columns: Date, Description, Amount, Status, Invoice
   - Status badges: Paid (green), Pending (yellow), Failed (red)
   - Download button per invoice
   - Filter by date range
   - Export all invoices as CSV

3. Implement invoice download:
   - Direct link to Paddle-hosted invoice PDF
   - Or generate custom branded invoice
   - Include business details, tax information
   - Watermarked with payment status

4. Add payment method display:
   - Show last 4 digits of card
   - Card brand logo (Visa, Mastercard, etc.)
   - Expiration date
   - "Update Payment Method" links to Paddle portal

5. Create upcoming payment preview:
   - Shows next billing date
   - Amount to be charged
   - Applied credits or discounts
   - Change/cancel options

6. Implement payment failure handling:
   - Email notification on failed payment
   - Dashboard banner with "Update Payment Method" link
   - Retry schedule displayed
   - Grace period countdown

**Acceptance Criteria**:

- Invoice list displays all historical invoices
- Download links work and provide valid PDFs
- Payment method shown securely (masked card number)
- Upcoming payment information accurate
- Failed payment alerts visible and actionable
- Billing history exportable to CSV
- All amounts displayed in correct currency

---

### Iteration 6.7: Testing & Edge Cases

**Duration**: 2 days

**Technical Tasks**:

1. Test all subscription flows:
   - New subscription (Free → Pro)
   - Upgrade (Pro → Enterprise)
   - Downgrade (Enterprise → Pro)
   - Cancellation with reactivation
   - Payment failure and recovery

2. Test webhook reliability:
   - Simulate delayed webhooks
   - Test duplicate webhook handling (idempotency)
   - Verify signature validation rejects invalid requests
   - Test malformed payload handling

3. Test edge cases:
   - Subscription during trial period
   - Multiple rapid plan changes
   - Cancellation immediately after signup
   - Expired credit card
   - Refund processing

4. Test feature gating:
   - Attempt API calls to restricted endpoints
   - Verify UI locks work correctly
   - Test limit enforcement (credits, sub-trainers)
   - Check gates after tier changes

5. Load testing:
   - Simulate 100 simultaneous checkouts
   - Verify webhook processing at scale
   - Check database performance with many subscriptions

6. Security testing:
   - Attempt to bypass feature gates
   - Test webhook signature validation
   - Verify API endpoints require authentication
   - Check for race conditions in credit deductions

**Acceptance Criteria**:

- All subscription flows complete successfully
- Webhooks processed reliably with idempotency
- Edge cases handled gracefully without data corruption
- Feature gates cannot be bypassed
- System handles high load without failures
- No security vulnerabilities identified

---

## EPIC 6 Completion Criteria

By the end of this epic, TrainerDesk will have a complete subscription and billing system with:

- ✅ Paddle integration with secure payment processing
- ✅ Three-tier subscription model (Free, Pro, Enterprise)
- ✅ Smooth checkout and upgrade flows
- ✅ Webhook handling for subscription lifecycle
- ✅ Comprehensive feature gating system
- ✅ Upgrade/downgrade with proration
- ✅ Invoice management and billing history
- ✅ Thorough testing and security validation

**Next Epic Preview**: EPIC 7 will implement Sub-Trainer Management for Pro/Enterprise tiers, including invitation system, permission management, separate calendars, and activity tracking.

---

This completes EPIC 6 with detailed iterations covering approximately 3 weeks of development work. The subscription system is critical for monetization and ensures TrainerDesk generates sustainable recurring revenue while providing clear value differentiation across tiers.
