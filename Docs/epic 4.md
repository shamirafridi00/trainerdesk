# EPIC 4: Page Builder & Templates (Sprint 4 - Weeks 8-10)

## Epic Overview

Build the page builder system that allows trainers to create and customize their public landing pages. This includes 5 pre-made templates, section-based editing with drag-and-drop reordering, customization options, and subdomain routing. The calendar widget from EPIC 3 will be embedded as a mandatory section.

---

### Iteration 4.1: Template Structure & Data Model

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to choose from pre-made templates so that I can quickly create a professional landing page
- As a developer, I need a flexible data structure so that template sections can be easily customized

**Technical Tasks**:

1. Define template configuration structure in `lib/types/template.ts`:

   ```typescript
   interface Section {
     id: string;
     type:
       | 'hero'
       | 'services'
       | 'testimonials'
       | 'faq'
       | 'contact'
       | 'calendar';
     order: number;
     visible: boolean;
     config: {
       // Section-specific configuration
       headline?: string;
       subheadline?: string;
       bgColor?: string;
       bgGradient?: string;
       image?: string;
       items?: any[];
     };
   }

   interface PageConfig {
     templateId: string;
     sections: Section[];
     globalStyles: {
       primaryColor: string;
       fontFamily: string;
       buttonStyle: string;
     };
   }
   ```

2. Create 5 template definitions in `components/page-builder/templates/`:
   - `minimal-template.tsx`: Single hero + calendar (clean, text-focused)
   - `bold-template.tsx`: Hero with large image + services grid + testimonials + calendar
   - `professional-template.tsx`: Hero + about section + services + FAQ + calendar
   - `modern-template.tsx`: Video background hero + pricing cards + calendar
   - `classic-template.tsx`: Traditional layout with contact form + calendar

3. Create default configurations for each template:
   - Store in `lib/constants/templates.ts`
   - Each template has pre-filled content (lorem ipsum replaceable)
   - Default color schemes matching template personality

4. Update Page model in Prisma schema:
   - Ensure `sections` JSON field can store array of section objects
   - Add `globalStyles` JSON field for theme-wide settings
   - Add `publishedAt` timestamp field

5. Create template preview thumbnails:
   - Design 1200x800px images for each template
   - Store in `public/images/templates/`
   - Show in template selection interface

6. Build template constants file with metadata:
   ```typescript
   export const TEMPLATES = {
     minimal: {
       id: 'minimal',
       name: 'Minimal',
       description: 'Clean and simple design focused on essentials',
       thumbnail: '/images/templates/minimal.png',
       defaultSections: [...]
     },
     // ... other templates
   }
   ```

**Acceptance Criteria**:

- Template data structure supports all required customization options
- 5 template definitions created with distinct designs
- Default configurations include realistic placeholder content
- Page model can store and retrieve complex section arrays
- Template preview images designed and saved
- TypeScript types ensure type safety across page builder

---

### Iteration 4.2: Template Selection & Initialization

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to browse available templates so that I can choose one that fits my brand
- As a trainer, I want to preview templates before selecting so that I make an informed choice
- As a trainer, I want to start with a template so that my page has professional content immediately

**Technical Tasks**:

1. Create page builder hub: `app/(dashboard)/page-builder/page.tsx`
   - Check if trainer already has a page
   - If yes, show "Edit Page" and "View Live Page" buttons
   - If no, show template gallery for selection
   - Display current subdomain prominently

2. Build template gallery: `components/page-builder/template-gallery.tsx`
   - Grid layout with template cards (2-3 columns)
   - Each card shows: thumbnail, name, description, "Preview" and "Use Template" buttons
   - Hover effect on cards (shadow elevation)
   - Responsive design for mobile (single column)

3. Create template preview modal: `components/page-builder/template-preview-modal.tsx`
   - Full-screen modal with iframe showing template
   - Navigation arrows to switch between templates
   - "Use This Template" button at bottom
   - Close button in corner

4. Build template initialization API: `app/api/pages/init/route.ts`
   - POST endpoint accepting templateId
   - Load default configuration for selected template
   - Create Page record with trainerId and sections
   - Return page ID for editing

5. Implement page creation flow:
   - Template selection → Preview → Confirm → Redirect to editor
   - Show loading state during page creation
   - Success toast: "Your page is ready! Let's customize it."

6. Add template switching option:
   - In page editor, add "Change Template" button
   - Warning modal: "Changing templates will reset your customizations"
   - Preserve calendar section configuration when switching

**Acceptance Criteria**:

- Template gallery displays all 5 templates with thumbnails
- Preview modal shows accurate representation of template
- Template selection creates page record in database
- Trainer redirected to editor after selection
- Page builder hub shows correct state (has page vs no page)
- Template switching preserves essential data (calendar config)

---

### Iteration 4.3: Section Editor with Drag-and-Drop

**Duration**: 4 days

**User Stories**:

- As a trainer, I want to reorder sections by dragging so that I can structure my page logically
- As a trainer, I want to see my sections listed so that I know what's on my page
- As a trainer, I want to remove sections I don't need so that my page stays focused

**Technical Tasks**:

1. Install drag-and-drop library: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

2. Create page editor layout: `app/(dashboard)/page-builder/edit/[pageId]/page.tsx`
   - Split view: section list (left) + preview panel (right)
   - Resize handle between panels
   - Top toolbar with: Save, Preview, Publish buttons
   - Auto-save indicator

3. Build section list component: `components/page-builder/section-editor.tsx`
   - Vertical list of section cards
   - Each card shows: section type icon, section name, visibility toggle, edit/delete buttons
   - Drag handle on left side of each card
   - "Add Section" button at bottom

4. Implement dnd-kit sortable:

   ```typescript
   import { DndContext, closestCenter } from '@dnd-kit/core';
   import {
     SortableContext,
     verticalListSortingStrategy,
     useSortable,
   } from '@dnd-kit/sortable';

   // Wrap section list in DndContext
   // Make each section card sortable
   // Handle onDragEnd to update order
   ```

5. Create sortable section card: `components/page-builder/sortable-section-card.tsx`
   - Use useSortable hook for drag behavior
   - Apply transform styles during drag
   - Show drag overlay/preview
   - Animate drop position

6. Build section addition modal: `components/page-builder/add-section-modal.tsx`
   - Grid of available section types with icons
   - Section types: Hero, Services, Testimonials, FAQ, Contact Form, Calendar (locked if exists)
   - Clicking section type adds to bottom of list
   - Calendar section can only exist once (show "Already added" if present)

7. Implement section removal:
   - Delete button on each section card
   - Confirmation dialog: "Remove this section? This cannot be undone."
   - Calendar section cannot be removed (hide delete button)
   - Update page configuration in state and database

8. Add visibility toggle:
   - Eye icon button on section card
   - Toggles section.visible property
   - Hidden sections shown with reduced opacity in list
   - Hidden sections don't render in preview/published page

9. Create auto-save functionality:
   - Debounce section changes (1 second delay)
   - PUT request to API updating page configuration
   - Show "Saving..." then "Saved" indicator
   - Error handling with retry option

**Acceptance Criteria**:

- Sections can be reordered by dragging with smooth animation
- Drag handle clearly indicates draggable area
- Section order updates persist to database
- New sections can be added from modal
- Sections can be deleted except calendar (with confirmation)
- Visibility toggle works and reflects in preview
- Auto-save triggers after edits with visual feedback
- Mobile touch gestures work for drag-and-drop

---

### Iteration 4.4: Section Customization Panel

**Duration**: 4 days

**User Stories**:

- As a trainer, I want to edit section content so that my page reflects my business
- As a trainer, I want to change colors and images so that my page matches my brand
- As a trainer, I want to see changes in real-time so that I know how edits look

**Technical Tasks**:

1. Build customization panel: `components/page-builder/customization-panel.tsx`
   - Right sidebar or slide-over panel
   - Opens when clicking "Edit" on section card
   - Tabs: Content, Styling, Advanced
   - Close button and "Done" button

2. Create section-specific editors:
   - `hero-section-editor.tsx`: Headline input, subheadline textarea, CTA button text/link, background options
   - `services-section-editor.tsx`: Add/edit/remove service items (title, description, icon)
   - `testimonials-section-editor.tsx`: Add/edit/remove testimonials (name, quote, rating, photo)
   - `faq-section-editor.tsx`: Add/edit/remove FAQ items (question, answer)
   - `contact-section-editor.tsx`: Enable/disable fields (phone, email, message), success message
   - `calendar-section-editor.tsx`: Header text, color scheme, show/hide duration selector

3. Build reusable form controls:
   - `color-picker.tsx`: Color wheel or preset palette swatches
   - `image-uploader.tsx`: Drag-and-drop upload with UploadThing, preview thumbnail
   - `gradient-picker.tsx`: Preset gradient options or custom creator
   - `font-selector.tsx`: Dropdown of web-safe fonts
   - `icon-picker.tsx`: Grid of Lucide React icons

4. Implement live preview updates:
   - Use React state management (Context or Zustand)
   - Section edits immediately update preview iframe
   - Debounce rapid changes to prevent excessive re-renders
   - Iframe communicates via postMessage for updates

5. Create array field editor for lists:
   - Services, testimonials, FAQs are arrays
   - Show list of items with edit/delete buttons
   - "Add New" button opens empty form
   - Drag handles for reordering items within section

6. Add validation:
   - Required fields (headline for hero, at least 1 service)
   - URL validation for links
   - Image size/format validation
   - Character limits with counters

7. Implement undo/redo functionality:
   - Track change history in state
   - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
   - Undo/redo buttons in toolbar
   - Limit history to last 20 changes

**Acceptance Criteria**:

- Clicking edit on any section opens customization panel
- All content fields editable with appropriate input types
- Color picker allows custom colors and shows presets
- Image upload works and shows preview
- Changes reflect immediately in preview panel
- Array fields (services, testimonials) can be added/edited/deleted/reordered
- Form validation prevents invalid data entry
- Undo/redo works for recent changes
- Panel responsive on smaller screens

---

### Iteration 4.5: Live Preview & Preview Mode

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to see my page while editing so that I know how it looks
- As a trainer, I want to preview my page full-screen so that I see the real experience
- As a trainer, I want preview to be responsive so that I test mobile layout

**Technical Tasks**:

1. Create preview component: `components/page-builder/section-preview.tsx`
   - Renders all visible sections in order
   - Uses actual section components from templates
   - Applies current customization values
   - Embedded in iframe for isolation

2. Build preview iframe: `components/page-builder/preview-iframe.tsx`
   - Loads preview route in iframe
   - Responsive container with device size switcher
   - Auto-height adjustment based on content
   - Refresh button to reload preview

3. Create preview route: `app/(dashboard)/page-builder/preview/[pageId]/page.tsx`
   - Minimal layout (no dashboard UI)
   - Fetches page configuration
   - Renders sections with current state
   - Listens for postMessage updates from parent

4. Implement device size switcher:
   - Toolbar buttons: Desktop (100%), Tablet (768px), Mobile (375px)
   - Clicking changes iframe width
   - Preview container centers smaller widths
   - Active button highlighted

5. Add full-screen preview mode:
   - "Preview" button in editor toolbar
   - Opens page in new tab or modal
   - Shows actual subdomain URL
   - Banner at top: "Preview Mode - Not Published"

6. Implement preview synchronization:
   - Parent window sends section updates via postMessage
   - Preview iframe receives messages and updates DOM
   - Debounce updates to prevent performance issues
   - Handle initial load and subsequent updates

7. Add interactive elements in preview:
   - Calendar widget fully functional in preview
   - Links clickable (open in new tab)
   - Forms disabled with overlay message: "This is a preview"

**Acceptance Criteria**:

- Preview panel shows real-time updates as sections edited
- Device size switcher changes preview width correctly
- Full-screen preview opens in new tab with accurate rendering
- Preview loads within 2 seconds of editor opening
- Mobile preview reflects responsive design accurately
- Calendar widget visible and styled correctly in preview
- No console errors in preview iframe

---

### Iteration 4.6: Publishing & Subdomain Routing

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to publish my page so that clients can access it
- As a client, I want to visit trainer's subdomain so that I can book a session
- As a trainer, I want to unpublish my page if I need to make major changes

**Technical Tasks**:

1. Create publish functionality:
   - "Publish" button in editor toolbar
   - Updates `published` field to true and sets `publishedAt` timestamp
   - API endpoint: `app/api/pages/[pageId]/publish/route.ts`
   - Success toast: "Your page is live at [subdomain].trainerdesk.com"
   - Copy link button

2. Implement subdomain routing in middleware: `middleware.ts`

   ```typescript
   import { NextRequest, NextResponse } from 'next/server';

   export function middleware(request: NextRequest) {
     const hostname = request.headers.get('host');
     const subdomain = hostname?.split('.')[0];

     // Check if subdomain exists and is not main domain
     if (subdomain && subdomain !== 'www' && subdomain !== 'trainerdesk') {
       // Query database for trainer with this subdomain
       // Rewrite to dynamic route: /[subdomain]/page
       return NextResponse.rewrite(new URL(`/pages/${subdomain}`, request.url));
     }

     return NextResponse.next();
   }
   ```

3. Create public page route: `app/[subdomain]/page.tsx`
   - Dynamic route accepting subdomain parameter
   - Fetch trainer by subdomain
   - Fetch published page configuration
   - Render sections with configured values
   - Return 404 if trainer not found or page not published

4. Build public page renderer: `components/page-builder/public-page-renderer.tsx`
   - Maps section types to components
   - Applies global styles (colors, fonts)
   - Renders calendar widget with trainer's availability
   - SEO meta tags (title, description, OG image)

5. Implement section components for public view:
   - Reuse template section components
   - Ensure all sections responsive
   - Add animations on scroll (Framer Motion)
   - Calendar widget connects to booking API

6. Add unpublish functionality:
   - "Unpublish" button in editor (only shows if published)
   - Confirmation modal: "Your page will be taken offline"
   - Sets `published` to false
   - Public route returns 404 or "Coming Soon" page

7. Create "Coming Soon" placeholder:
   - Shown when subdomain exists but page not published
   - Simple message: "This page is being set up. Check back soon!"
   - TrainerDesk branding

8. Add SEO optimization:
   - Dynamic page title from trainer business name
   - Meta description from trainer bio
   - Open Graph tags for social sharing
   - Structured data for local business (JSON-LD)

**Acceptance Criteria**:

- Published pages accessible at subdomain.trainerdesk.com
- Middleware correctly routes subdomain requests
- Public page renders all sections accurately
- Calendar widget functional on public page (can create bookings)
- Unpublished pages show appropriate message
- SEO meta tags present and accurate
- Page loads within 3 seconds on 4G connection
- Responsive on all device sizes

---

### Iteration 4.7: Global Styling & White-Label Options

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to set a primary color so that my page matches my brand
- As an Enterprise trainer, I want to remove TrainerDesk branding so that the page is fully mine

**Technical Tasks**:

1. Create global styles editor: `app/(dashboard)/page-builder/settings/page.tsx`
   - Primary color picker (affects buttons, links, accents)
   - Secondary color picker (optional)
   - Font family selector (10-15 web-safe fonts)
   - Button style options (rounded, square, pill)
   - Preview of styles applied to sample elements

2. Implement CSS variable injection:
   - Convert selected colors to CSS custom properties
   - Inject `<style>` tag in page head with variables
   - All components reference variables: `var(--primary-color)`
   - Changes apply immediately across entire page

3. Add white-label option (Enterprise tier only):
   - Toggle: "Remove TrainerDesk branding"
   - Hides footer text "Powered by TrainerDesk"
   - Shows upgrade prompt if not on Enterprise tier
   - Check subscription tier in API before saving

4. Create brand asset upload:
   - Favicon upload (16x16, 32x32, ICO format)
   - Logo upload for navigation (transparent PNG recommended)
   - OG image upload for social sharing (1200x630)
   - Preview uploaded assets

5. Implement font loading:
   - Use next/font for Google Fonts integration
   - Preload selected font for performance
   - Fallback to system fonts if load fails

6. Add custom CSS option (Advanced):
   - Textarea for custom CSS rules
   - Warning: "Advanced users only"
   - Sanitize input to prevent XSS
   - Apply custom CSS with low specificity

**Acceptance Criteria**:

- Primary color changes apply to buttons, links, and accents
- Font family selector updates all text immediately
- White-label toggle only available for Enterprise tier
- Brand assets (favicon, logo) upload and display correctly
- Custom CSS applies without breaking layout
- Changes persist after page refresh
- Preview shows accurate representation of styled page

---

### Iteration 4.8: Testing & Polish

**Duration**: 2 days

**Technical Tasks**:

1. Cross-browser testing:
   - Test page builder in Chrome, Firefox, Safari, Edge
   - Test published pages on mobile browsers (iOS Safari, Chrome Android)
   - Fix any rendering inconsistencies

2. Performance optimization:
   - Optimize images with Next.js Image component
   - Lazy load sections below fold
   - Minimize JavaScript bundle size
   - Enable Vercel edge caching for published pages

3. Accessibility improvements:
   - Keyboard navigation for section editor
   - ARIA labels for drag handles and buttons
   - Color contrast checks (WCAG AA compliance)
   - Screen reader testing for public pages

4. Error handling:
   - Handle failed image uploads gracefully
   - Prevent data loss with auto-save recovery
   - Show helpful error messages for API failures

5. User testing:
   - Create test trainer accounts with various templates
   - Walk through complete page building flow
   - Gather feedback on usability issues
   - Document and fix identified bugs

6. Documentation:
   - Create help articles: "Creating Your First Page", "Customizing Sections", "Publishing Your Page"
   - Add tooltips in page builder for complex features
   - Include video tutorial link in help section

**Acceptance Criteria**:

- Page builder works consistently across major browsers
- Published pages load within 3 seconds
- Accessibility score >90 in Lighthouse
- No data loss during extended editing sessions
- User testing reveals no blocking issues
- Help documentation available and clear

---

## EPIC 4 Completion Criteria

By the end of this epic, TrainerDesk will have a fully functional page builder with:

- ✅ 5 professional pre-made templates
- ✅ Drag-and-drop section reordering
- ✅ Comprehensive customization options
- ✅ Live preview with device sizing
- ✅ Publishing to subdomain with middleware routing
- ✅ Global styling and white-label options
- ✅ SEO optimization and responsive design
- ✅ Embedded functional calendar widget

**Next Epic Preview**: EPIC 5 will build the Notification System (Resend + Twilio integration) for automated emails and SMS including booking confirmations, reminders, and custom templates.

---

This completes EPIC 4 with detailed iterations covering approximately 3 weeks of development work. The page builder provides tremendous value to trainers by enabling them to create professional landing pages without technical skills, while the calendar widget integration creates a seamless booking experience for clients.
