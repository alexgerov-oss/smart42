This project must be REFACTORED, not rewritten.

Cursor MUST:
- Reuse existing components
- Reuse existing pages and routes
- Reuse existing UI structure
- Refactor logic inside current files

Cursor MUST NOT:
- Create a new architecture
- Replace the app with a new implementation
- Introduce new state libraries unless required

SYSTEM RULE 
This document defines the complete business logic of the application. UI, layout, spacing, colors, and visual structure must NOT be changed unless explicitly stated. 
1. USER ROLES & ACCESS LEVELS Roles: 
Admin 
Full Access 
Open / Close Only 
1.1	Admin Admin has full control over the system. Admin CAN: 
Add / edit / delete doors 
Add / edit / delete app users 
Add / edit / delete iButtons
View Activity 
Change controller settings 
Rename anything globally 
Start / manage trial 
Upgrade to premium 
Admin CANNOT: 
Be restricted by any trial limitations 
1.2	Full Access Full Access is a power user with limitations. 
Full Access CAN: 
Lock / unlock doors 
Rename doors (local rename – visible only to this user) 
Rename iButtons (local rename – visible only to this user) 
Add app users ONLY if: 
Admin has premium 
OR Admin has active trial 
Full Access CANNOT: 
Add doors 
Delete doors 
See admin-only settings 
Change controller-level settings 
See admin-only name overrides 
1.3	Open / Close Only 
Minimal access user. 
Open / Close Only CAN: 
Lock / unlock doors 
Open / Close Only CANNOT: 
Add doors 
Add users 
Rename anything 
Access Activity 
Access Settings 
2. TRIAL & PREMIUM LOGIC 
Trial: 
Trial is owned by Admin 
Trial affects permissions of Full Access users 
Trial enables: 
Adding app users 
Advanced features 
When trial ends: 
Full Access loses user-management permissions 
UI buttons become disabled (not hidden unless specified) 
3. DOORS LOGIC 
Door Identity: 
Each door has: 
id 
systemName (immutable) 
createdBy (admin) 
createdAt 
Door Display Name: 
Each user can have: 
localDoorName[userId][doorId] 
Rules: 
Local door name is visible ONLY to the user who set it 
Changing tabs or reload MUST preserve the name 
Local names persist across sessions 
4. IBUTTON LOGIC 
iButton Identity: 
Each iButton has: 
id 
systemName 
createdBy 
createdAt 
iButton Display Names: 
Each role can override name locally. 
Rules: 
Admin sees only admin-defined name 
Full Access sees only their own renamed version 
Name changes are NOT shared across roles 
Rename modal must show the LAST name set by the current user 
5. APP USERS LOGIC 
App User Naming: 
Admin and Full Access can rename users locally 
Name changes are visible ONLY to the user who made them 
App Users list must reflect local naming 
Switching tabs must NOT reset names 
6. HOME SCREEN BEHAVIOR
 On login → scroll position must be at TOP 
On trial activation → redirect to Home, scroll TOP 
Door dropdown expands dynamically with controls aligned right 
Add (+) and Edit (✏️) buttons: 
Visible ONLY to Admin 
Right-aligned 
Spacing preserved 
7. ACTIVITY ACCESS 
Admin → full access 
Full Access → access allowed Open / Close Only → NO access (tab hidden or blocked) 
8. CONTROLLER INPUT VALIDATION 
Controller ID: 
Confirm button active ONLY after ≥ 8 characters 
Restart controller: 
Requires confirmation modal 
9. UI STABILITY RULES 
No layout resizing on dynamic text 
Containers must reserve max height 
Auto lock / closed labels move upward instead of resizing container 
10. LOCAL OVERRIDE STORAGE RULES
Persistence: 
All local name overrides MUST be persisted. 
Allowed storage: 
Backend (preferred) 
OR localStorage scoped by: 
userId 
doorId / iButtonId / appUserId 
Example: 
localDoorName[userId][doorId] = "My Door Name" 
Rules: 
Overrides MUST survive: 
tab switch 
page reload 
logout / login 
Overrides MUST NOT leak between users 
All logic must be backend-ready.
Local storage is a temporary mock.
Data structures must be compatible with future API replacement.
11. NAME RESOLUTION PRIORITY 
When displaying a name: 
Check local override for current user 
If not exists → fallback to system/admin name 
Never merge names between roles 
Admin NEVER sees: 
Full Access local names 
Open/Close Only local names 
12. ROLE CHANGE BEHAVIOR 
If a user's role changes: 
Their local overrides remain stored 
UI permissions update immediately 
Hidden buttons stay hidden 
Disabled buttons stay disabled 
No data cleanup unless explicitly deleted. 
13. UI PROTECTION RULE 
Cursor MUST: 
NOT rename components 
NOT merge components 
NOT change layout, spacing, colors 
NOT remove animation or transitions 
NOT refactor CSS unless explicitly told 
Allowed changes: 
State logic 
Data flow 
Validation 
Permission guards 
14. ERROR SAFETY RULES 
If permission logic fails: 
Default to MOST restrictive behavior 
Disable buttons instead of enabling 
Never allow forbidden action silently 
15. DEVELOPMENT MODE RULE 
While refactoring: 
No feature removal 
No visual cleanup 
No “simplification” of UI 
Only logic corrections allowed.
