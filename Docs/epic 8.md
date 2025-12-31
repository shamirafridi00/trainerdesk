# EPIC 8: Domain Management & Deployment (Sprint 8 - Weeks 20-22)

## Epic Overview

Implement custom domain connection with DNS verification, SSL certificate automation, subdomain routing optimization, production deployment to Vercel, monitoring setup, and analytics integration. This epic prepares TrainerDesk for production launch and enables Pro/Enterprise trainers to use their own domains for professional branding.

---

### Iteration 8.1: Custom Domain Connection System

**Duration**: 3 days

**User Stories**:

- As a Pro trainer, I want to connect my custom domain so that my page has professional branding
- As a trainer, I want clear DNS instructions so that I can configure my domain correctly
- As a trainer, I want domain verification so that I know my setup is working

**Technical Tasks**:

1. Create domain settings page: `app/(dashboard)/settings/domain/page.tsx`
   - Feature gate: Pro/Enterprise only with upgrade prompt
   - Current domain display (subdomain.trainerdesk.com)
   - Custom domain input field
   - DNS configuration instructions
   - Verification status indicator
   - "Verify Domain" button

2. Build DNS instruction component: `components/domain/dns-instructions.tsx`
   - Step-by-step guide with visual aids
   - Required records: CNAME record (www → cname.vercel.app), A record (@ → Vercel IP)
   - Copy buttons for easy pasting
   - Provider-specific guides (GoDaddy, Namecheap, Cloudflare)
   - Troubleshooting section

3. Create domain validation API: `app/api/domain/verify/route.ts`
   - POST: Accept custom domain from trainer
   - Use DNS lookup to verify CNAME/A records
   - Check propagation status
   - Call Vercel Domains API to add domain
   - Update Trainer.customDomain field
   - Return verification result

4. Implement Vercel Domains API integration:

   ```typescript
   async function addDomainToVercel(domain: string) {
     const response = await fetch(
       `https://api.vercel.com/v10/projects/${projectId}/domains`,
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ name: domain }),
       }
     );
     return response.json();
   }
   ```

5. Add DNS propagation checker:
   - Use dns.promises.resolve4() for A records
   - Use dns.promises.resolveCname() for CNAME
   - Show real-time status: Checking → Found → Verified
   - Estimate propagation time (usually 1-48 hours)

6. Create domain status widget:
   - Green: Active & Secure (SSL provisioned)
   - Yellow: Pending DNS Propagation
   - Orange: Configuration Error
   - Red: Verification Failed
   - Detailed status messages with action steps

7. Implement domain removal:
   - "Remove Custom Domain" button
   - Confirmation warning: "Your page will revert to subdomain"
   - Remove from Vercel via API
   - Clear Trainer.customDomain field
   - Immediate effect (subdomain becomes active again)

8. Add multiple domain support (Enterprise only):
   - Store domains as JSON array in database
   - Primary domain designation
   - All domains point to same page
   - Useful for trainers with multiple brands

**Acceptance Criteria**:

- Pro/Enterprise trainers can input custom domains
- DNS instructions clear and accurate for major providers
- Domain verification detects correct DNS configuration
- Vercel API successfully adds verified domains
- SSL certificates auto-provision within 24 hours
- Status widget displays accurate real-time information
- Domain removal works without affecting subdomain access
- Multiple domains supported for Enterprise tier

---

### Iteration 8.2: SSL Certificate Automation

**Duration**: 2 days

**User Stories**:

- As a trainer, I want automatic SSL certificates so that my page is secure
- As a client, I want to see the secure padlock icon so that I trust the booking page
- As a trainer, I want certificate renewal handled automatically so that I don't experience downtime

**Technical Tasks**:

1. Configure automatic SSL provisioning:
   - Vercel automatically provisions Let's Encrypt certificates
   - No manual configuration needed on our end
   - Certificates issued after DNS verification complete
   - Process typically takes 1-15 minutes

2. Create SSL status monitoring:
   - Query Vercel API for certificate status
   - Display in domain settings page
   - Show expiration date and renewal schedule
   - Alert if certificate fails to provision

3. Build certificate troubleshooting guide:
   - Help article for common SSL issues
   - CAA record requirements
   - DNS propagation delays
   - Firewall or proxy issues
   - Link to Vercel support documentation

4. Implement HTTPS redirection:
   - Middleware automatically redirects HTTP to HTTPS
   - Works for both custom domains and subdomains
   - No action needed from trainers
   - Configure in `next.config.js` headers

5. Add SSL badge to landing page:
   - Optional "Secured by SSL" badge in footer
   - Trust indicator for clients
   - Links to certificate details
   - Can be hidden for white-label (Enterprise)

6. Create certificate renewal monitoring:
   - Vercel handles auto-renewal
   - Monitor for renewal failures
   - Alert trainer 7 days before expiration if issue
   - Provide resolution steps

**Acceptance Criteria**:

- SSL certificates provision automatically for all domains
- HTTPS enforced for all traffic (no HTTP access)
- Certificate status visible in domain settings
- Troubleshooting guide addresses common issues
- Auto-renewal works without intervention
- Alert system in place for certificate issues
- Clients see secure padlock in browser

---

### Iteration 8.3: Subdomain Routing Optimization

**Duration**: 2 days

**User Stories**:

- As a client, I want fast page loads so that I can book sessions quickly
- As a developer, I need efficient subdomain routing so that the system scales
- As a trainer, I want my subdomain to work reliably so that clients can always access my page

**Technical Tasks**:

1. Optimize middleware performance:
   - Current middleware in `middleware.ts` extracts subdomain and queries database
   - Add caching layer (Redis or Vercel KV) for subdomain lookups
   - Cache trainer data for 5 minutes
   - Reduce database queries by 95%

2. Implement edge caching:
   - Configure Next.js ISR (Incremental Static Regeneration)
   - Published pages cached at edge for 60 seconds
   - Revalidate on publish action
   - Dramatically faster load times globally

3. Create subdomain availability checker:
   - API endpoint: `GET /api/subdomains/check?subdomain=johndoe`
   - Returns available or taken
   - Used during registration
   - Prevents conflicts

4. Add subdomain validation:
   - Regex pattern: alphanumeric and hyphens only
   - Length: 3-63 characters
   - Reserved subdomains: www, api, app, admin, mail, ftp
   - Case-insensitive matching

5. Implement subdomain change functionality:
   - Allow trainers to change subdomain once
   - Warning: "Old links will break"
   - Update database and clear cache
   - Redirect old subdomain to new (optional, 30-day grace period)

6. Add wildcard subdomain configuration:
   - Vercel project settings: Enable wildcard subdomains (\*.trainerdesk.com)
   - DNS: Add wildcard A/CNAME record
   - Middleware handles all subdomains dynamically

7. Create 404 handling for invalid subdomains:
   - Custom 404 page: "This trainer page doesn't exist"
   - Suggestion: "Visit trainerdesk.com to create your own page"
   - Search functionality to find trainers by name

**Acceptance Criteria**:

- Subdomain routing completes in <50ms
- Caching reduces database load significantly
- Edge caching improves global load times
- Subdomain availability checker accurate
- Validation prevents invalid subdomain creation
- Wildcard subdomain configuration working
- 404 page helpful and professional
- Subdomain changes process smoothly

---

### Iteration 8.4: Production Deployment Setup

**Duration**: 3 days

**User Stories**:

- As a developer, I need to deploy to production so that users can access TrainerDesk
- As a business, I want reliable hosting so that the service has high uptime
- As a developer, I need environment separation so that testing doesn't affect production

**Technical Tasks**:

1. Set up Vercel project:
   - Connect GitHub repository to Vercel
   - Configure production and preview environments
   - Set environment variables in Vercel dashboard
   - Configure build settings (Next.js framework preset)

2. Configure environment variables:
   - Production variables in Vercel dashboard
   - Separate values for dev/staging/production
   - Secrets: Database URL, API keys (Paddle, Resend, Twilio, NextAuth secret)
   - Public variables: Paddle vendor ID, plan IDs

3. Set up custom production domain:
   - Add trainerdesk.com to Vercel project
   - Configure DNS (A and CNAME records)
   - Verify SSL certificate provisioned
   - Test www and root domain access

4. Create staging environment:
   - Separate Vercel project or preview deployments
   - staging.trainerdesk.com subdomain
   - Separate database (staging environment)
   - Test all features before production push

5. Configure database for production:
   - Use Neon or Supabase production tier
   - Connection pooling enabled (Prisma Data Proxy)
   - Automated backups configured (daily snapshots)
   - Performance monitoring enabled

6. Set up deployment workflow:
   - GitHub Actions or Vercel Git integration
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests
   - Manual approval for production releases (optional)

7. Create deployment checklist document:
   - Pre-deployment steps (tests, migration, environment variables)
   - Deployment process
   - Post-deployment verification
   - Rollback procedure if issues occur

8. Implement health check endpoint: `app/api/health/route.ts`
   - Returns system status (database, external APIs)
   - Used by monitoring services
   - Response: `{ status: 'healthy', timestamp, database: 'connected' }`

**Acceptance Criteria**:

- Vercel project connected to GitHub successfully
- Production deployment completes without errors
- Environment variables configured correctly
- Custom domain (trainerdesk.com) accessible with SSL
- Staging environment available for testing
- Database production-ready with backups
- Deployment workflow automated and reliable
- Health check endpoint responsive

---

### Iteration 8.5: Monitoring & Error Tracking

**Duration**: 3 days

**User Stories**:

- As a developer, I want to track errors so that I can fix bugs quickly
- As a business, I want uptime monitoring so that I know when the service is down
- As a developer, I want performance metrics so that I can optimize the application

**Technical Tasks**:

1. Integrate error tracking with Sentry:
   - Install Sentry: `npm install @sentry/nextjs`
   - Initialize Sentry in `sentry.client.config.ts` and `sentry.server.config.ts`
   - Configure DSN from Sentry dashboard
   - Set up source maps for production debugging
   - Test error capture in development

2. Configure error alerting:
   - Slack integration for critical errors
   - Email notifications for high-severity issues
   - Alert thresholds (e.g., >10 errors/minute)
   - On-call rotation (as team grows)

3. Set up uptime monitoring:
   - Use UptimeRobot or Better Uptime (free tier)
   - Monitor: Main site, API health endpoint, booking flow
   - Check interval: Every 5 minutes
   - Alert via email/SMS on downtime
   - Status page for public transparency

4. Implement application performance monitoring:
   - Vercel Analytics (built-in, free)
   - Track: Page load times, Core Web Vitals, API response times
   - Set performance budgets
   - Alert on degradation

5. Add custom event tracking:
   - Track key user actions: Signup, Subscription, Booking created
   - Use Vercel Analytics custom events or PostHog
   - Funnel analysis for conversion optimization
   - Retention cohorts tracking

6. Create admin dashboard for monitoring:
   - `app/(admin)/monitoring/page.tsx` (restricted access)
   - Display: Active users, Error rate, API latency
   - Recent errors with stack traces
   - Database connection pool status
   - Link to external monitoring tools

7. Set up database monitoring:
   - Neon/Supabase built-in monitoring
   - Track: Query performance, Connection count, Storage usage
   - Alert on slow queries (>1 second)
   - Identify N+1 query problems

8. Implement rate limiting:
   - Protect API endpoints from abuse
   - Use Upstash Redis or Vercel KV for rate limit storage
   - Limits: 100 requests/minute per IP, 1000/hour per user
   - Return 429 Too Many Requests with Retry-After header

**Acceptance Criteria**:

- Sentry captures and reports errors in production
- Alert notifications received for critical errors
- Uptime monitoring detects and reports downtime
- Performance metrics tracked for all pages
- Custom events recorded for key actions
- Admin dashboard displays real-time monitoring data
- Database performance monitored and optimized
- Rate limiting prevents API abuse

---

### Iteration 8.6: Analytics & Business Intelligence

**Duration**: 2 days

**User Stories**:

- As a business owner, I want to track user growth so that I understand product traction
- As a product manager, I want conversion metrics so that I can optimize funnels
- As a marketer, I want traffic sources so that I can focus acquisition efforts

**Technical Tasks**:

1. Integrate Google Analytics 4:
   - Create GA4 property
   - Install Next.js Google Analytics: `npm install @next/third-parties`
   - Add tracking code to root layout
   - Configure events: Page views, Signups, Subscriptions, Bookings

2. Set up conversion tracking:
   - Define goals: Signup, First booking, Subscription purchase
   - Track funnel: Landing → Signup → Page creation → First booking
   - Measure drop-off at each stage
   - Calculate conversion rates

3. Implement UTM parameter tracking:
   - Capture UTM parameters in URL
   - Store in session/cookie
   - Associate with user signup
   - Track which marketing channels drive conversions

4. Create internal analytics dashboard:
   - `app/(admin)/analytics/page.tsx`
   - Metrics: Total users, Active trainers, MRR, Churn rate
   - Charts: Growth over time, Subscription distribution
   - Data from database aggregations

5. Set up revenue tracking:
   - Sync with Paddle revenue data
   - Calculate MRR (Monthly Recurring Revenue)
   - Track upgrades, downgrades, churn
   - LTV (Lifetime Value) calculations

6. Implement feature usage analytics:
   - Track: Page builder usage, Booking volume, Notification sends
   - Identify power users vs inactive users
   - Feature adoption rates
   - Used for product decisions

7. Add privacy compliance:
   - Cookie consent banner (GDPR/CCPA)
   - Allow users to opt out of tracking
   - Privacy policy page
   - Data processing agreement in terms

8. Create weekly metrics email:
   - Automated report every Monday
   - Sent to founders/stakeholders
   - Key metrics: New signups, MRR, Active users, Top features
   - Link to full analytics dashboard

**Acceptance Criteria**:

- Google Analytics tracking all key pages and events
- Conversion funnel reports showing drop-off rates
- UTM parameters captured and associated with users
- Internal analytics dashboard displays business metrics
- Revenue accurately tracked from Paddle
- Feature usage data collected and analyzable
- Privacy compliance measures implemented
- Weekly metrics email delivers automatically

---

### Iteration 8.7: Final Testing & Launch Preparation

**Duration**: 3 days

**Technical Tasks**:

1. End-to-end testing in production:
   - Complete user journey: Signup → Subscribe → Create page → Book session
   - Test all subscription tiers and features
   - Verify email/SMS delivery in production
   - Test payment processing with real cards (small amounts)
   - Verify webhook reliability

2. Performance optimization final pass:
   - Lighthouse audit (target: >90 score)
   - Optimize images (WebP, lazy loading)
   - Minimize JavaScript bundles
   - Enable compression and caching headers
   - Test on 3G network for mobile performance

3. Security audit:
   - Review authentication implementation
   - Check for XSS vulnerabilities
   - Verify CSRF protection
   - Test rate limiting effectiveness
   - Scan for exposed secrets or sensitive data
   - Review Prisma queries for SQL injection safety

4. Cross-browser testing:
   - Test on Chrome, Firefox, Safari, Edge
   - Mobile browsers: iOS Safari, Chrome Android
   - Verify responsive design at all breakpoints
   - Test booking flow on mobile devices

5. Load testing production:
   - Simulate 100 concurrent users
   - Test database connection pooling
   - Verify API response times under load
   - Check for memory leaks
   - Test booking conflicts at scale

6. Documentation completion:
   - User help center with all features documented
   - Video tutorials for key workflows
   - API documentation (if exposing API)
   - Developer setup guide for team members
   - Troubleshooting common issues

7. Launch checklist execution:
   - ✅ All environment variables set
   - ✅ Database migrations applied
   - ✅ DNS configured and verified
   - ✅ SSL certificates active
   - ✅ Monitoring and alerts configured
   - ✅ Backup systems tested
   - ✅ Payment processing verified
   - ✅ Email/SMS delivery working
   - ✅ Legal pages (Terms, Privacy) published
   - ✅ Support email configured

8. Soft launch preparation:
   - Invite beta users (10-20 trainers)
   - Collect feedback on onboarding
   - Monitor for critical bugs
   - Iterate based on user feedback
   - Prepare for public launch marketing

**Acceptance Criteria**:

- All end-to-end tests pass successfully
- Performance scores meet targets (>90 Lighthouse)
- Security audit reveals no critical vulnerabilities
- Application works across all major browsers
- Load testing shows system handles concurrent users
- Documentation complete and accessible
- Launch checklist fully completed
- Beta users successfully onboarded

---

## EPIC 8 Completion Criteria

By the end of this epic, TrainerDesk will be fully deployed to production with:

- ✅ Custom domain connection with DNS verification
- ✅ Automatic SSL certificate provisioning
- ✅ Optimized subdomain routing with caching
- ✅ Production deployment on Vercel
- ✅ Comprehensive monitoring and error tracking
- ✅ Analytics and business intelligence integration
- ✅ Complete testing and launch preparation
- ✅ Ready for public launch

**Next Epic Preview**: EPIC 9 will implement Analytics & Reporting features including advanced trainer analytics, client retention tracking, revenue forecasting (for Pro/Enterprise), custom report builder, and dashboard widgets for actionable insights.

---

This completes EPIC 8 with detailed iterations covering approximately 3 weeks of development work. The domain management and deployment infrastructure ensures TrainerDesk is production-ready, scalable, secure, and provides professional branding options for trainers while maintaining excellent performance and reliability for all users.
