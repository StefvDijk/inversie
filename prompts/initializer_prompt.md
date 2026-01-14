## YOUR ROLE - INITIALIZER AGENT (Session 1 of Many)

You are the FIRST agent in a long-running autonomous development process.
Your job is to set up the foundation for all future coding agents.

### FIRST: Read the Project Specification

Start by reading `app_spec.txt` in your working directory. This file contains
the complete specification for what you need to build. Read it carefully
before proceeding.

### CRITICAL FIRST TASK: Create Features

Based on `app_spec.txt`, create features using the feature_create_bulk tool. The features are stored in a SQLite database,
which is the single source of truth for what needs to be built.

**Creating Features:**

Use the feature_create_bulk tool to add all features at once:

```
Use the feature_create_bulk tool with features=[
  {
    "category": "functional",
    "name": "Brief feature name",
    "description": "Brief description of the feature and what this test verifies",
    "steps": [
      "Step 1: Navigate to relevant page",
      "Step 2: Perform action",
      "Step 3: Verify expected result"
    ]
  },
  {
    "category": "style",
    "name": "Brief feature name",
    "description": "Brief description of UI/UX requirement",
    "steps": [
      "Step 1: Navigate to page",
      "Step 2: Take screenshot",
      "Step 3: Verify visual requirements"
    ]
  }
]
```

**Notes:**
- IDs and priorities are assigned automatically based on order
- All features start with `passes: false` by default
- You can create features in batches if there are many (e.g., 50 at a time)

**Requirements for features:**

- Feature count must match the `feature_count` specified in app_spec.txt (190 features for this project)
- Both "functional" and "style" categories
- Mix of narrow tests (2-5 steps) and comprehensive tests (10+ steps)
- At least 25 tests MUST have 10+ steps each (more for complex apps)
- Order features by priority: fundamental features first (the API assigns priority based on order)
- All features start with `passes: false` automatically
- Cover every feature in the spec exhaustively
- **MUST include tests from ALL 20 mandatory categories below**

---

## MANDATORY TEST CATEGORIES

The feature_list.json **MUST** include tests from ALL of these categories. The minimum counts scale by complexity tier.

### Category Distribution (This is a Medium-Complex App: ~190 features)

| Category                         | Minimum |
| -------------------------------- | ------- |
| A. Security & Access Control     | 15      |
| B. Navigation Integrity          | 20      |
| C. Real Data Verification        | 25      |
| D. Workflow Completeness         | 15      |
| E. Error Handling                | 12      |
| F. UI-Backend Integration        | 15      |
| G. State & Persistence           | 8       |
| H. URL & Direct Access           | 8       |
| I. Double-Action & Idempotency   | 6       |
| J. Data Cleanup & Cascade        | 8       |
| K. Default & Reset               | 6       |
| L. Search & Filter Edge Cases    | 10      |
| M. Form Validation               | 12      |
| N. Feedback & Notification       | 8       |
| O. Responsive & Layout           | 8       |
| P. Accessibility                 | 8       |
| Q. Temporal & Timezone           | 6       |
| R. Concurrency & Race Conditions | 6       |
| S. Export/Import                 | 5       |
| T. Performance                   | 5       |
| **TOTAL**                        | **190** |

---

### A. Security & Access Control Tests

Test that unauthorized access is blocked and permissions are enforced.

**Required tests (examples):**

- Unauthenticated user cannot access protected routes (redirect to login)
- Client cannot access bewindvoerder-only pages (403 or redirect)
- API endpoints return 401 for unauthenticated requests
- API endpoints return 403 for unauthorized role access
- Session expires after 30 minutes of inactivity
- Logout clears all session data and tokens
- Invalid/expired tokens are rejected
- Each role can ONLY see their permitted menu items
- Direct URL access to unauthorized pages is blocked
- PIN change requires current PIN verification
- Cannot access another client's data by manipulating IDs in URL
- Biometric authentication fallback to PIN works correctly
- Failed PIN attempts are handled (no information leakage)

### B. Navigation Integrity Tests

Test that every button, link, and menu item goes to the correct place.

**Required tests (examples):**

- Every tab in bottom navigation goes to correct screen
- Every button in potjes overview navigates to correct potje detail
- All action buttons (Approve, Deny, Edit, Delete) perform correct action
- Back button works correctly after each navigation
- Deep linking works (notification tap opens correct screen)
- Bottom tab highlights correct active tab
- 404/Not Found screen shown for non-existent routes
- After login, user sees correct home screen for their role
- After logout, user sees PIN entry screen
- Pagination in lists works correctly
- Modal close buttons return to previous state
- Cancel buttons on forms return to previous screen
- Beslis-Protocol wizard navigation (next/back) works correctly

### C. Real Data Verification Tests

Test that data is real (not mocked) and persists correctly.

**Required tests (examples):**

- Create a decision via UI with unique content → verify it appears in history
- Create a decision → close app → reopen → decision still exists
- Create money request → refresh → request still exists
- Edit a savings goal → verify changes persist after refresh
- Delete a document → verify it's gone from list
- Filter transactions → results match actual data
- Dashboard potjes show real amounts (create spending, amounts update)
- Survey responses are saved and show in history
- Appointments appear in both client and bewindvoerder views
- Transactions imported via CSV appear in client's transaction list
- Reflection responses link to correct decisions
- Notifications contain real data from actual events

### D. Workflow Completeness Tests

Test that every workflow can be completed end-to-end through the UI.

**Required tests (examples):**

- Complete Beslis-Protocol flow: start → answer questions → select potje → submit → receive approval → reflect
- Complete money request flow: create with photo → submit → bewindvoerder approves → notification received
- Complete Lees Simpel flow: take photo → process → view result → save
- Complete survey flow: start → answer all questions → submit → view results
- Complete savings goal flow: create → track progress → celebrate completion
- Complete appointment flow: view slots → select → book → confirm → reminder
- Bewindvoerder can approve and deny both decisions and money requests
- Bewindvoerder can upload CSV and see transactions in client view
- User can change language and see all UI update
- User can change text size and see all UI update

### E. Error Handling Tests

Test graceful handling of errors and edge cases.

**Required tests (examples):**

- Network failure during decision submit shows friendly error
- Invalid PIN shows clear error message
- Camera permission denied shows explanation
- AI document processing failure shows retry option
- Calendar integration failure shows clear message
- Empty search results show "no results found" message
- Loading states shown during all async operations
- Timeout doesn't hang the app indefinitely
- Submitting form with server error keeps user data
- Photo upload too large shows clear size limit message
- Invalid CSV import shows specific error feedback

### F. UI-Backend Integration Tests

Test that frontend and backend communicate correctly.

**Required tests (examples):**

- Creating decision sends correct data to API
- Potje list populated from real database data
- Category dropdown in money request shows actual potjes
- Changes in one screen reflect in related screens after navigation
- Deleting potje affects related decisions correctly
- Transaction filters work with actual data attributes
- Sort functionality sorts real data correctly
- Pull-to-refresh fetches fresh data from server
- API error responses are parsed and displayed correctly
- Loading spinners appear during API calls
- Push notifications trigger correct API updates

### G. State & Persistence Tests

Test that state is maintained correctly across sessions and app states.

**Required tests (examples):**

- Close app mid-survey - can resume from where left off
- Background app for 30+ minutes - graceful re-authentication
- Unsaved decision draft - warning when navigating away
- App killed during save - data not corrupted
- Language preference persists across app restarts
- Text size preference persists across app restarts
- Notification preferences persist correctly

### H. URL & Direct Access Tests

Test deep linking and direct screen access.

**Required tests (examples):**

- Notification deep link opens correct decision detail
- Notification deep link opens correct appointment detail
- Invalid decision ID in deep link shows not found
- Deep link without authentication redirects to login first
- After login via deep link, continues to intended screen
- Shared appointment link works for correct users

### I. Double-Action & Idempotency Tests

Test that rapid or duplicate actions don't cause issues.

**Required tests (examples):**

- Double-tap submit on decision - only one decision created
- Rapid taps on approve button - only one approval sent
- Double-tap delete on goal - only one deletion
- Multiple reflection submits - only one saved
- Submit button disabled during processing
- Booking same appointment slot twice handled correctly

### J. Data Cleanup & Cascade Tests

Test that deleting data cleans up properly everywhere.

**Required tests (examples):**

- Delete client - all related data removed (decisions, requests, etc.)
- Delete potje - decisions using that potje handled correctly
- Delete document - removed from saved documents list
- Delete savings goal - removed from all views
- Cancel pending decision - removed from bewindvoerder's pending list
- Mark appointment as cancelled - status updates everywhere

### K. Default & Reset Tests

Test that defaults and reset functionality work correctly.

**Required tests (examples):**

- New decision form shows correct default potje selection
- Date picker defaults to appropriate dates
- Language defaults to Dutch (nl) for new users
- Text size defaults to medium
- Clear filters button resets all transaction filters
- Survey starts at first question by default

### L. Search & Filter Edge Cases

Test search and filter functionality thoroughly.

**Required tests (examples):**

- Empty search in transactions shows all transactions
- Search with special characters in transaction description
- Filter by date range with no results shows message
- Filter transactions by category works correctly
- Multiple filters combined work correctly
- Filter persists after viewing detail and returning to list
- Clear individual filter works correctly

### M. Form Validation Tests

Test all form validation rules exhaustively.

**Required tests (examples):**

- Decision amount required - shows error if empty
- Money request requires photo - shows error if missing
- Money request requires category - shows error if missing
- Savings goal requires name - shows error if empty
- Savings goal target amount must be positive
- PIN must be 4-6 digits
- Appointment notes have max length
- Survey text responses have reasonable limits
- Error messages are specific and helpful
- Errors clear when user fixes the issue

### N. Feedback & Notification Tests

Test that users get appropriate feedback for all actions.

**Required tests (examples):**

- Successful decision submit shows success message
- Successful money request shows pending status
- Failed action shows error with guidance
- Loading spinner during all async operations
- Progress indicator during survey
- Document processing shows progress
- Goal completion shows celebration animation
- Approval notification arrives and is accurate

### O. Responsive & Layout Tests

Test that the UI works on different screen sizes.

**Required tests (examples):**

- Layout correct on iPhone SE (small)
- Layout correct on iPhone 14 Pro Max (large)
- Layout correct on iPad
- Layout correct on Android phone
- No horizontal scroll on any screen
- Touch targets large enough (min 48px)
- Modals fit within screen on all devices
- Long text wraps correctly

### P. Accessibility Tests

Test basic accessibility compliance.

**Required tests (examples):**

- Screen reader can navigate all main screens
- Focus states visible on all interactive elements
- Text size adjustment affects all text
- High contrast mode provides sufficient contrast
- All images have alt text
- Form fields have associated labels
- Error messages announced to screen reader
- No information conveyed by color alone

### Q. Temporal & Timezone Tests

Test date/time handling.

**Required tests (examples):**

- Transaction dates display correctly
- Appointment times display in correct timezone
- Reflection prompt arrives next day (not same day)
- Quarterly survey reminder arrives at correct intervals
- Potje budget reset works on correct day
- Deadline from documents displays correctly

### R. Concurrency & Race Condition Tests

Test multi-user and race condition scenarios.

**Required tests (examples):**

- Bewindvoerder approves while client views - updates correctly
- Two bewindvoerders don't double-approve same request
- Client edits while bewindvoerder views - handled gracefully
- Appointment slot booked while client selecting - shows unavailable
- Rapid navigation doesn't cause stale data display

### S. Export/Import Tests

Test data import functionality.

**Required tests (examples):**

- CSV import with valid data creates all transactions
- CSV import with invalid format shows clear error
- CSV import with duplicate transactions handled correctly
- Large CSV import shows progress
- Survey results can be shared/exported

### T. Performance Tests

Test basic performance requirements.

**Required tests (examples):**

- App loads in < 3 seconds
- Transaction list with 100+ items scrolls smoothly
- Document AI processing completes in reasonable time
- Animations don't lag
- No console errors during normal operation

---

## ABSOLUTE PROHIBITION: NO MOCK DATA

The feature_list.json must include tests that **actively verify real data** and **detect mock data patterns**.

**Include these specific tests:**

1. Create unique test data (e.g., "TEST_12345_VERIFY_ME")
2. Verify that EXACT data appears in UI
3. Refresh / close and reopen - data persists
4. Delete data - verify it's gone
5. If data appears that wasn't created during test - FLAG AS MOCK DATA

**The agent implementing features MUST NOT use:**

- Hardcoded arrays of fake data
- `mockData`, `fakeData`, `sampleData`, `dummyData` variables
- `// TODO: replace with real API`
- `setTimeout` simulating API delays with static data
- Static returns instead of database queries

---

**CRITICAL INSTRUCTION:**
IT IS CATASTROPHIC TO REMOVE OR EDIT FEATURES IN FUTURE SESSIONS.
Features can ONLY be marked as passing (via the `feature_mark_passing` tool with the feature_id).
Never remove features, never edit descriptions, never modify testing steps.
This ensures no functionality is missed.

### SECOND TASK: Create init.sh

Create a script called `init.sh` that future agents can use to quickly
set up and run the development environment. The script should:

1. Install any required dependencies
2. Start any necessary servers or services
3. Print helpful information about how to access the running application

Base the script on the technology stack specified in `app_spec.txt`:
- Node.js 20+ with npm
- Expo CLI for React Native
- SQLite database
- Backend API server

### THIRD TASK: Initialize Git

Create a git repository and make your first commit with:

- init.sh (environment setup script)
- README.md (project overview and setup instructions)
- Any initial project structure files

Note: Features are stored in the SQLite database (features.db), not in a JSON file.

Commit message: "Initial setup: init.sh, project structure, and features created via API"

### FOURTH TASK: Create Project Structure

Set up the basic project structure based on what's specified in `app_spec.txt`.
This should include:
- `/frontend` - Expo React Native app
- `/backend` - Node.js Express API
- `/shared` - Shared types/utilities
- Database schema setup with Prisma

### OPTIONAL: Start Implementation

If you have time remaining in this session, you may begin implementing
the highest-priority features. Get the next feature with:

```
Use the feature_get_next tool
```

Remember:
- Work on ONE feature at a time
- Test thoroughly before marking as passing
- Commit your progress before session ends

### ENDING THIS SESSION

Before your context fills up:

1. Commit all work with descriptive messages
2. Create `claude-progress.txt` with a summary of what you accomplished
3. Verify features were created using the feature_get_stats tool
4. Leave the environment in a clean, working state

The next agent will continue from here with a fresh context window.

---

**Remember:** You have unlimited time across many sessions. Focus on
quality over speed. Production-ready is the goal.
