**BGG COMMUNITY PLATFORM**

Frontend Tasks & Issues

  -------------------------- --------------------------------------------
  **Version**                1.0

  **Based on**               PRD v1.1 + User Stories v1.1

  **Status**                 Draft

  **Date**                   March 2026

  **Prepared by**            Tolu Towoju
  -------------------------- --------------------------------------------

**How to Use This Document**

Each section maps to a screen from the wireframe handoff. Tasks are
broken into atomic frontend issues ready to be raised in Jira, Linear,
or GitHub Issues. Columns are:

-   Task ID --- unique reference (e.g. FE-M0-01)

-   Task / Issue --- the specific frontend work item, written as an
    actionable ticket title

-   UI Components to Build --- the discrete components required to
    complete the task

-   Linked Stories --- the user story IDs from the User Stories doc that
    this task delivers

-   Type --- Screen \| Component \| Logic \| State \| Style (see legend
    below)

  --------------- --------------------------------------------------------
  **Type**        **Meaning**

  **Screen**      Top-level page / route that needs to be scaffolded

  **Component**   Reusable UI element (button, card, modal, form field)

  **Logic**       Event handlers, API calls, validation, business rules

  **State**       Context, hooks, local state, or store management

  **Style**       Responsive layout, Tailwind classes, design tokens
  --------------- --------------------------------------------------------

*Sprint colour coding in screen headers: Sprint 1--2 = green \| Sprint
3--4 = amber \| Sprint 5--6 = teal \| Sprint 7--8 = purple*

**Sprint 1 --- Auth & Onboarding**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M0 |                      |                    |          |        |
| L   |                      |                    |          |        |
| and |                      |                    |          |        |
| ing |                      |                    |          |        |
| /   |                      |                    |          |        |
| Aut |                      |                    |          |        |
| h** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 1   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 01, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 02, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 03* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold auth page   | -   AuthPage       | US-01,   | **Sc   |
| E-M | layout and route     |     wrapper        | US-02    | reen** |
| 0-0 |                      |                    |          |        |
| 1** |                      | -   Centered card  |          |        |
|     |                      |     container      |          |        |
|     |                      |                    |          |        |
|     |                      | -   BGG logo /     |          |        |
|     |                      |     brand header   |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Sign In with   | -                  | US-01    | *      |
| E-M | Google button        |  GoogleOAuthButton |          | *Compo |
| 0-0 |                      |     component      |          | nent** |
| 2** |                      |                    |          |        |
|     |                      | -   OAuth redirect |          |        |
|     |                      |     handler        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Loading        |          |        |
|     |                      |     spinner state  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build email +        | -   EmailInput     | US-02    | *      |
| E-M | password sign-in     |     field          |          | *Compo |
| 0-0 | form                 |                    |          | nent** |
| 3** |                      | -   PasswordInput  |          |        |
|     |                      |     field (toggle  |          |        |
|     |                      |     visibility)    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Sign In submit |          |        |
|     |                      |     button         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Form error     |          |        |
|     |                      |     message        |          |        |
|     |                      |     component      |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build email +        | -   EmailInput     | US-02    | *      |
| E-M | password sign-up     |                    |          | *Compo |
| 0-0 | form                 | -                  |          | nent** |
| 4** |                      |    PasswordInput + |          |        |
|     |                      |     confirm        |          |        |
|     |                      |     password       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Password       |          |        |
|     |                      |     strength       |          |        |
|     |                      |     indicator      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Sign Up submit |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement form       | -   Inline error   | US-02    | **L    |
| E-M | validation (signup)  |     states:        |          | ogic** |
| 0-0 |                      |     duplicate      |          |        |
| 5** |                      |     email, weak    |          |        |
|     |                      |     password,      |          |        |
|     |                      |     invalid format |          |        |
|     |                      |                    |          |        |
|     |                      | -   Real-time      |          |        |
|     |                      |     validation     |          |        |
|     |                      |     hook           |          |        |
|     |                      |     (              |          |        |
|     |                      | useFormValidation) |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Forgot         | -   \'Forgot       | US-03    | **Sc   |
| E-M | Password flow        |     password?\'    |          | reen** |
| 0-0 |                      |     link           |          |        |
| 6** |                      |                    |          |        |
|     |                      | -   Email input    |          |        |
|     |                      |     modal / page   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Confirmation   |          |        |
|     |                      |     message        |          |        |
|     |                      |     component      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Link expiry    |          |        |
|     |                      |     error state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Handle auth routing  | -   Redirect new   | US-01,   | **L    |
| E-M | logic                |     users →        | US-02    | ogic** |
| 0-0 |                      |     onboarding     |          |        |
| 7** |                      |                    |          |        |
|     |                      | -   Redirect       |          |        |
|     |                      |     returning      |          |        |
|     |                      |     users →        |          |        |
|     |                      |     dashboard      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Auth state     |          |        |
|     |                      |     guard (useAuth |          |        |
|     |                      |     hook)          |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Style auth page ---  | -   Mobile-first   | US-01,   | **S    |
| E-M | responsive layout    |     layout         | US-02    | tyle** |
| 0-0 |                      |                    |          |        |
| 8** |                      | -   Tailwind card  |          |        |
|     |                      |     shadow,        |          |        |
|     |                      |     spacing        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Accessible     |          |        |
|     |                      |     focus states   |          |        |
|     |                      |     on all inputs  |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M1 |                      |                    |          |        |
| O   |                      |                    |          |        |
| nbo |                      |                    |          |        |
| ard |                      |                    |          |        |
| ing |                      |                    |          |        |
| --- |                      |                    |          |        |
| P   |                      |                    |          |        |
| rof |                      |                    |          |        |
| ile |                      |                    |          |        |
| S   |                      |                    |          |        |
| etu |                      |                    |          |        |
| p** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 1   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 04, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 05, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 06, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 07* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold multi-step  | -                  | US-04    | **Sc   |
| E-M | onboarding shell     |   OnboardingLayout |          | reen** |
| 1-0 |                      |     wrapper        |          |        |
| 1** |                      |                    |          |        |
|     |                      | -   Step progress  |          |        |
|     |                      |     indicator (1   |          |        |
|     |                      |     of N)          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Next / Back    |          |        |
|     |                      |     navigation     |          |        |
|     |                      |     buttons        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Step state     |          |        |
|     |                      |     machine        |          |        |
|     |                      |     (              |          |        |
|     |                      | useOnboardingStep) |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Step 1 ---     | -   NameInput      | US-04    | *      |
| E-M | Basic info form      |                    |          | *Compo |
| 1-0 |                      | -                  |          | nent** |
| 2** |                      |    OccupationInput |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      | UniversityOrgInput |          |        |
|     |                      |                    |          |        |
|     |                      | -   Required field |          |        |
|     |                      |     validation     |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Step 2 ---     | -   AvatarUpload   | US-04    | *      |
| E-M | Profile photo upload |     component      |          | *Compo |
| 1-0 |                      |                    |          | nent** |
| 3** |                      |   (drag-and-drop + |          |        |
|     |                      |     click)         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Image          |          |        |
|     |                      |     preview + crop |          |        |
|     |                      |     UI             |          |        |
|     |                      |                    |          |        |
|     |                      | -   Remove /       |          |        |
|     |                      |     replace photo  |          |        |
|     |                      |     option         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Fallback       |          |        |
|     |                      |     avatar         |          |        |
|     |                      |     initials       |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Step 3 ---     | -   LinkedInInput  | US-05    | *      |
| E-M | Social links input   |                    |          | *Compo |
| 1-0 |                      | -   TwitterXInput  |          | nent** |
| 4** |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   OtherSocialInput |          |        |
|     |                      |     (generic URL)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Add/remove     |          |        |
|     |                      |     social row     |          |        |
|     |                      |     dynamically    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Step 4 ---     | -   Pr             | US-06    | *      |
| E-M | Privacy toggles      | ofileVisibleToggle |          | *Compo |
| 1-0 |                      |     (default ON)   |          | nent** |
| 5** |                      |                    |          |        |
|     |                      | -   So             |          |        |
|     |                      | cialsVisibleToggle |          |        |
|     |                      |     (default OFF)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Toggle         |          |        |
|     |                      |     description    |          |        |
|     |                      |     labels         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Persist toggle |          |        |
|     |                      |     state on       |          |        |
|     |                      |     submit         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Step 5 ---     | -   SkipButton     | US-07    | *      |
| E-M | Optional Dev Plan    |     (routes to     |          | *Compo |
| 1-0 | setup                |     dashboard)     |          | nent** |
| 6** |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    DevPlanMiniForm |          |        |
|     |                      |     (goal + first  |          |        |
|     |                      |     milestone +    |          |        |
|     |                      |     date)          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Save +         |          |        |
|     |                      |     continue       |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement onboarding | -   Save each step | US-04,   | **S    |
| E-M | state persistence    |     to API on Next | US-05,   | tate** |
| 1-0 |                      |                    | US-06,   |        |
| 7** |                      | -   Resume from    | US-07    |        |
|     |                      |     last           |          |        |
|     |                      |     incomplete     |          |        |
|     |                      |     step if user   |          |        |
|     |                      |     drops off      |          |        |
|     |                      |                    |          |        |
|     |                      | -   useOnboarding  |          |        |
|     |                      |     context / hook |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Show \'Complete Dev  | -   ProfileBanner  | US-07    | *      |
| E-M | Plan\' prompt in     |     component:     |          | *Compo |
| 1-0 | profile if skipped   |     \'Complete     |          | nent** |
| 8** |                      |     your Dev       |          |        |
|     |                      |     Plan\'         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Link to dev    |          |        |
|     |                      |     plan page      |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 2 --- Member Dashboard & Events**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **M |                      |                    |          |        |
| 2.0 |                      |                    |          |        |
| Mem |                      |                    |          |        |
| ber |                      |                    |          |        |
| App |                      |                    |          |        |
| Sh  |                      |                    |          |        |
| ell |                      |                    |          |        |
| /   |                      |                    |          |        |
| Nav |                      |                    |          |        |
| iga |                      |                    |          |        |
| tio |                      |                    |          |        |
| n** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 2   |                      |                    |          |        |
| *   |                      |                    |          |        |
| All |                      |                    |          |        |
| mem |                      |                    |          |        |
| ber |                      |                    |          |        |
| st  |                      |                    |          |        |
| ori |                      |                    |          |        |
| es* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build global app     | -   SideNav        | All      | **Sc   |
| E-M | shell layout         |     component      | member   | reen** |
| 2-0 |                      |     (desktop)      |          |        |
| 1** |                      |                    |          |        |
|     |                      | -   BottomNav      |          |        |
|     |                      |     component      |          |        |
|     |                      |     (mobile)       |          |        |
|     |                      |                    |          |        |
|     |                      | -   TopBar with    |          |        |
|     |                      |     notification   |          |        |
|     |                      |     bell + user    |          |        |
|     |                      |     avatar         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Route outlet / |          |        |
|     |                      |     page content   |          |        |
|     |                      |     area           |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build SideNav links  | -   Nav items:     | US-29    | *      |
| E-M | and active states    |     Dashboard,     |          | *Compo |
| 2-0 |                      |     Jobs,          |          | nent** |
| 2** |                      |     Community,     |          |        |
|     |                      |     Members,       |          |        |
|     |                      |     Cohorts        |          |        |
|     |                      |                    |          |        |
|     |                      | -   ActiveLink     |          |        |
|     |                      |     highlight      |          |        |
|     |                      |     state          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Cohort         |          |        |
|     |                      |     sub-links      |          |        |
|     |                      |     (dynamic from  |          |        |
|     |                      |     API)           |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build notification   | -                  | US-59,   | *      |
| E-M | bell dropdown        |   NotificationBell | US-60,   | *Compo |
| 2-0 |                      |     icon with      | US-61,   | nent** |
| 3** |                      |     unread badge   | US-62    |        |
|     |                      |                    |          |        |
|     |                      | -   Not            |          |        |
|     |                      | ificationsDropdown |          |        |
|     |                      |     panel          |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   NotificationItem |          |        |
|     |                      |     component      |          |        |
|     |                      |     (icon +        |          |        |
|     |                      |     message +      |          |        |
|     |                      |     timestamp)     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Mark-all-read  |          |        |
|     |                      |     action         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build user avatar    | -   UserAvatarMenu | US-04    | *      |
| E-M | menu (top right)     |     dropdown       |          | *Compo |
| 2-0 |                      |                    |          | nent** |
| 4** |                      | -   Links: View    |          |        |
|     |                      |     Profile,       |          |        |
|     |                      |     Settings, Log  |          |        |
|     |                      |     out            |          |        |
|     |                      |                    |          |        |
|     |                      | -   Display name + |          |        |
|     |                      |     avatar         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement auth route | -   ProtectedRoute | US-01,   | **L    |
| E-M | guards               |     HOC / wrapper  | US-02    | ogic** |
| 2-0 |                      |                    |          |        |
| 5** |                      | -   Redirect       |          |        |
|     |                      |                    |          |        |
|     |                      |    unauthenticated |          |        |
|     |                      |     users to /auth |          |        |
|     |                      |                    |          |        |
|     |                      | -   Admin vs       |          |        |
|     |                      |     Member route   |          |        |
|     |                      |     split          |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M3 |                      |                    |          |        |
| Das |                      |                    |          |        |
| hbo |                      |                    |          |        |
| ard |                      |                    |          |        |
| Hom |                      |                    |          |        |
| e** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 2   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 08, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 09, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 10, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 11, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 12, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 13* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold Dashboard   | -   DashboardPage  | US-08    | **Sc   |
| E-M | page layout          |     2-column       |          | reen** |
| 3-0 |                      |     layout (main + |          |        |
| 1** |                      |     action center) |          |        |
|     |                      |                    |          |        |
|     |                      | -   Section        |          |        |
|     |                      |     headings:      |          |        |
|     |                      |     Schedule, Past |          |        |
|     |                      |     Recordings,    |          |        |
|     |                      |     Featured Jobs  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Skeleton       |          |        |
|     |                      |     loaders for    |          |        |
|     |                      |     each section   |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build EventCard      | -   EventCard:     | US-08,   | *      |
| E-M | component (Schedule  |     title,         | US-09,   | *Compo |
| 3-0 | section)             |     date/time,     | US-10    | nent** |
| 2** |                      |     host           |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    RSVPStatusBadge |          |        |
|     |                      |     (RSVP\'d / Not |          |        |
|     |                      |     RSVP\'d)       |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   RSVPToggleButton |          |        |
|     |                      |     (toggle        |          |        |
|     |                      |     attending      |          |        |
|     |                      |     state)         |          |        |
|     |                      |                    |          |        |
|     |                      | -   JoinButton     |          |        |
|     |                      |     (opens         |          |        |
|     |                      |     external URL   |          |        |
|     |                      |     in new tab)    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Error state:   |          |        |
|     |                      |     \'Meeting link |          |        |
|     |                      |     unavailable.   |          |        |
|     |                      |     Contact your   |          |        |
|     |                      |     admin.\'       |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement RSVP       | -   RSVP API call  | US-09    | **L    |
| E-M | toggle logic         |     on button      |          | ogic** |
| 3-0 |                      |     click          |          |        |
| 3** |                      |                    |          |        |
|     |                      | -   Optimistic UI  |          |        |
|     |                      |     update         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Sync RSVP      |          |        |
|     |                      |     state to       |          |        |
|     |                      |     server         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Past           | -   RecordingCard: | US-11    | *      |
| E-M | Recordings section   |     YouTube        |          | *Compo |
| 3-0 |                      |     thumbnail +    |          | nent** |
| 4** |                      |     title          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Click opens    |          |        |
|     |                      |     YouTube URL in |          |        |
|     |                      |     new tab        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No           |          |        |
|     |                      |     recordings     |          |        |
|     |                      |     yet\'          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter by      |          |        |
|     |                      |     cohort         |          |        |
|     |                      |     (implicit ---  |          |        |
|     |                      |     API filtered)  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Featured Jobs  | -   JobCardMini:   | US-12    | *      |
| E-M | section (dashboard)  |     title,         |          | *Compo |
| 3-0 |                      |     company,       |          | nent** |
| 5** |                      |     location       |          |        |
|     |                      |                    |          |        |
|     |                      | -   ApplyButton    |          |        |
|     |                      |     (external URL) |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      | SeekReferralButton |          |        |
|     |                      |     (conditional)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No jobs      |          |        |
|     |                      |     posted yet\'   |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Action Center  | -                  | US-13    | *      |
| E-M | panel                |  ActionCenterPanel |          | *Compo |
| 3-0 |                      |     component      |          | nent** |
| 6** |                      |                    |          |        |
|     |                      | -   MilestoneItem: |          |        |
|     |                      |     title, due     |          |        |
|     |                      |     date, overdue  |          |        |
|     |                      |     flag           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Link to dev    |          |        |
|     |                      |     plan page      |          |        |
|     |                      |                    |          |        |
|     |                      | -   \'Set new      |          |        |
|     |                      |     plan\' CTA     |          |        |
|     |                      |     when all       |          |        |
|     |                      |     complete       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No upcoming  |          |        |
|     |                      |     milestones\'   |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Wire dashboard data  | -   useSchedule    | US-08,   | **S    |
| E-M | fetching             |     hook           | US-11,   | tate** |
| 3-0 |                      |                    | US-12,   |        |
| 7** |                      | -   useRecordings  | US-13    |        |
|     |                      |     hook           |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    useFeaturedJobs |          |        |
|     |                      |     hook           |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    useActionCenter |          |        |
|     |                      |     hook           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Error boundary |          |        |
|     |                      |     per section    |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 3 --- Cohorts / Groups**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **  |                      |                    |          |        |
| M6- |                      |                    |          |        |
| Coh |                      |                    |          |        |
| ort |                      |                    |          |        |
| Coh |                      |                    |          |        |
| ort |                      |                    |          |        |
| /   |                      |                    |          |        |
| Gr  |                      |                    |          |        |
| oup |                      |                    |          |        |
| Pag |                      |                    |          |        |
| e** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 3   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 29, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 30, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 31, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 32, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 33, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 34* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold Cohort page | -   CohortPage     | US-29    | **Sc   |
| E-C | with tab navigation  |     layout         |          | reen** |
| 3-0 |                      |                    |          |        |
| 1** |                      | -   TabBar:        |          |        |
|     |                      |     Members \|     |          |        |
|     |                      |     Resources \|   |          |        |
|     |                      |     Sessions \|    |          |        |
|     |                      |     Recordings \|  |          |        |
|     |                      |     Feed           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Cohort name +  |          |        |
|     |                      |     description    |          |        |
|     |                      |     header         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state if |          |        |
|     |                      |     user has no    |          |        |
|     |                      |     cohorts        |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Cohort Members | -                  | US-30    | *      |
| E-C | tab                  |    MemberListItem: |          | *Compo |
| 3-0 |                      |     avatar, name,  |          | nent** |
| 2** |                      |     occupation     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Scrollable     |          |        |
|     |                      |     member list    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Resources tab  | -   ResourceItem:  | US-31    | *      |
| E-C |                      |     title +        |          | *Compo |
| 3-0 |                      |     external link  |          | nent** |
| 3** |                      |                    |          |        |
|     |                      | -   Open resource  |          |        |
|     |                      |     in new tab     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No resources |          |        |
|     |                      |     uploaded yet\' |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Sessions tab   | -   Reuse          | US-32    | *      |
| E-C | (cohort events)      |     EventCard      |          | *Compo |
| 3-0 |                      |     component from |          | nent** |
| 4** |                      |     M3             |          |        |
|     |                      |                    |          |        |
|     |                      | -   RSVP + Join    |          |        |
|     |                      |     behave         |          |        |
|     |                      |     identically to |          |        |
|     |                      |     dashboard      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter to      |          |        |
|     |                      |                    |          |        |
|     |                      |    cohort-specific |          |        |
|     |                      |     events only    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Recordings tab | -   Reuse          | US-33    | *      |
| E-C | (cohort)             |     RecordingCard  |          | *Compo |
| 3-0 |                      |     component from |          | nent** |
| 5** |                      |     M3             |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter to      |          |        |
|     |                      |                    |          |        |
|     |                      |    cohort-specific |          |        |
|     |                      |     recordings     |          |        |
|     |                      |     only           |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Cohort Feed    | -   PostCard:      | US-34    | *      |
| E-C | tab                  |     author avatar, |          | *Compo |
| 3-0 |                      |     name,          |          | nent** |
| 6** |                      |     timestamp,     |          |        |
|     |                      |     body           |          |        |
|     |                      |                    |          |        |
|     |                      | -   ReplyThread    |          |        |
|     |                      |     component      |          |        |
|     |                      |                    |          |        |
|     |                      |    (chronological, |          |        |
|     |                      |     oldest first)  |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    CreatePostForm: |          |        |
|     |                      |     title + body   |          |        |
|     |                      |     textarea +     |          |        |
|     |                      |     Submit         |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   CreateReplyForm: |          |        |
|     |                      |     inline reply   |          |        |
|     |                      |     input          |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   DeletePostButton |          |        |
|     |                      |     (own posts     |          |        |
|     |                      |     only, with     |          |        |
|     |                      |     confirm modal) |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'Be the first |          |        |
|     |                      |     to post\'      |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement cohort     | -   Hide feed tab  | US-34    | **L    |
| E-C | feed access control  |     / block        |          | ogic** |
| 3-0 | (frontend)           |     compose for    |          |        |
| 7** |                      |     non-members    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Guard route by |          |        |
|     |                      |     cohort         |          |        |
|     |                      |     membership     |          |        |
|     |                      |     check          |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Wire cohort data     | -   u              | U        | **S    |
| E-C | fetching             | seCohort(cohortId) | S-29--34 | tate** |
| 3-0 |                      |     hook           |          |        |
| 8** |                      |                    |          |        |
|     |                      | -   Fetch members, |          |        |
|     |                      |     resources,     |          |        |
|     |                      |     sessions,      |          |        |
|     |                      |     recordings,    |          |        |
|     |                      |     posts          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Real-time or   |          |        |
|     |                      |     polling for    |          |        |
|     |                      |     feed updates   |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 4 --- Recordings (YouTube Links)**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **  |                      |                    |          |        |
| M3- |                      |                    |          |        |
| Rec |                      |                    |          |        |
| R   |                      |                    |          |        |
| eco |                      |                    |          |        |
| rdi |                      |                    |          |        |
| ngs |                      |                    |          |        |
| --- |                      |                    |          |        |
| Da  |                      |                    |          |        |
| shb |                      |                    |          |        |
| oar |                      |                    |          |        |
| d + |                      |                    |          |        |
| Co  |                      |                    |          |        |
| hor |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 4   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 11, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 33, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 52* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build RecordingCard  | -   YouTube        | US-11,   | *      |
| E-R | component (shared)   |     thumbnail      | US-33    | *Compo |
| 4-0 |                      |     (auto-fetched  |          | nent** |
| 1** |                      |     from URL)      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Recording      |          |        |
|     |                      |     title          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Cohort label   |          |        |
|     |                      |     badge          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Click opens    |          |        |
|     |                      |     YouTube in new |          |        |
|     |                      |     tab            |          |        |
|     |                      |                    |          |        |
|     |                      | -   Hover state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement YouTube    | -   Parse YouTube  | US-11,   | **L    |
| E-R | thumbnail extraction |     URL → extract  | US-33,   | ogic** |
| 4-0 |                      |     video ID       | US-52    |        |
| 2** |                      |                    |          |        |
|     |                      | -   Construct      |          |        |
|     |                      |     thumbnail URL  |          |        |
|     |                      |                    |          |        |
|     |                      |  (img.youtube.com) |          |        |
|     |                      |                    |          |        |
|     |                      | -   Fallback       |          |        |
|     |                      |     placeholder if |          |        |
|     |                      |     thumbnail      |          |        |
|     |                      |     fails          |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Recordings     | -   RecordingsPage | US-11,   | **Sc   |
| E-R | page / full list     |     with all       | US-33    | reen** |
| 4-0 | view                 |     cohort         |          |        |
| 3** |                      |     recordings     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter by      |          |        |
|     |                      |     cohort         |          |        |
|     |                      |     dropdown       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Grid or list   |          |        |
|     |                      |     layout toggle  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Style recording grid | -   2-col desktop, | US-11,   | **S    |
| E-R | --- responsive       |     1-col mobile   | US-33    | tyle** |
| 4-0 |                      |                    |          |        |
| 4** |                      | -   Card aspect    |          |        |
|     |                      |     ratio          |          |        |
|     |                      |     maintained for |          |        |
|     |                      |     thumbnails     |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 5 --- Jobs & Referral**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M4 |                      |                    |          |        |
| J   |                      |                    |          |        |
| obs |                      |                    |          |        |
| Pag |                      |                    |          |        |
| e** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 5   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 14, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 15, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 16* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold Jobs page   | -   JobsPage with  | US-14    | **Sc   |
| E-J | layout               |     list + filter  |          | reen** |
| 5-0 |                      |     sidebar        |          |        |
| 1** |                      |                    |          |        |
|     |                      | -   Page header    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Search input   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Skeleton       |          |        |
|     |                      |     loaders        |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build JobCard        | -   JobCard:       | US-14,   | *      |
| E-J | component (full)     |     title,         | US-15,   | *Compo |
| 5-0 |                      |     company,       | US-16    | nent** |
| 2** |                      |     location,      |          |        |
|     |                      |     description    |          |        |
|     |                      |     snippet        |          |        |
|     |                      |                    |          |        |
|     |                      | -   ApplyButton →  |          |        |
|     |                      |     opens external |          |        |
|     |                      |     URL in new tab |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      | SeekReferralButton |          |        |
|     |                      |     (shown only if |          |        |
|     |                      |                    |          |        |
|     |                      |  referralAvailable |          |        |
|     |                      |     = true)        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Refe           |          |        |
|     |                      | rralRequestedBadge |          |        |
|     |                      |     (\'Request     |          |        |
|     |                      |     already sent\' |          |        |
|     |                      |     --- disables   |          |        |
|     |                      |     button)        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Error state:   |          |        |
|     |                      |                    |          |        |
|     |                      |    missing/invalid |          |        |
|     |                      |     apply URL      |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Job Detail     | -   JobDetailModal | US-14,   | **Sc   |
| E-J | view / modal         |     or page: full  | US-15    | reen** |
| 5-0 |                      |     description,   |          |        |
| 3** |                      |     eligibility,   |          |        |
|     |                      |     company        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Apply + Seek   |          |        |
|     |                      |     Referral       |          |        |
|     |                      |     buttons (same  |          |        |
|     |                      |     rules)         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Back           |          |        |
|     |                      |     navigation     |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement Seek       | -   POST referral  | US-16    | **L    |
| E-J | Referral action +    |     request on     |          | ogic** |
| 5-0 | deduplication        |     click          |          |        |
| 4** |                      |                    |          |        |
|     |                      | -   Disable        |          |        |
|     |                      |     button + show  |          |        |
|     |                      |     \'Request      |          |        |
|     |                      |     already sent\' |          |        |
|     |                      |     after          |          |        |
|     |                      |     submission     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Toast: \'Admin |          |        |
|     |                      |     notified. They |          |        |
|     |                      |     will contact   |          |        |
|     |                      |     you.\'         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Prevent        |          |        |
|     |                      |     duplicate      |          |        |
|     |                      |     submission     |          |        |
|     |                      |     (check         |          |        |
|     |                      |     existing       |          |        |
|     |                      |     request on     |          |        |
|     |                      |     load)          |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Jobs search +  | -   SearchInput    | US-14    | *      |
| E-J | filter               |     (filter by     |          | *Compo |
| 5-0 |                      |     title/company) |          | nent** |
| 5** |                      |                    |          |        |
|     |                      | -   LocationFilter |          |        |
|     |                      |     dropdown       |          |        |
|     |                      |                    |          |        |
|     |                      | -   RoleTypeFilter |          |        |
|     |                      |     dropdown       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter state   |          |        |
|     |                      |     management     |          |        |
|     |                      |     (useJobFilters |          |        |
|     |                      |     hook)          |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Wire jobs data       | -   useJobs hook   | US-14,   | **S    |
| E-J | fetching             |     with filter    | US-15,   | tate** |
| 5-0 |                      |     params         | US-16    |        |
| 6** |                      |                    |          |        |
|     |                      | -   useRef         |          |        |
|     |                      | erralStatus(jobId) |          |        |
|     |                      |     to check       |          |        |
|     |                      |     existing       |          |        |
|     |                      |     requests       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No jobs      |          |        |
|     |                      |     posted yet\'   |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 6 --- Community Discussion & Member Directory**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **M |                      |                    |          |        |
| 6.1 |                      |                    |          |        |
| Com |                      |                    |          |        |
| mun |                      |                    |          |        |
| ity |                      |                    |          |        |
| D   |                      |                    |          |        |
| isc |                      |                    |          |        |
| uss |                      |                    |          |        |
| ion |                      |                    |          |        |
| B   |                      |                    |          |        |
| oar |                      |                    |          |        |
| d** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 6   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 19, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 20, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 21* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold Community   | -   CommunityPage  | US-19    | **Sc   |
| E-D | Discussion page      |     layout         |          | reen** |
| 6-0 |                      |                    |          |        |
| 1** |                      | -   PostList       |          |        |
|     |                      |     section        |          |        |
|     |                      |                    |          |        |
|     |                      | -   CreatePost CTA |          |        |
|     |                      |     (sticky or top |          |        |
|     |                      |     of list)       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No posts yet |          |        |
|     |                      |     --- start the  |          |        |
|     |                      |     conversation\' |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build CreatePostForm | -   TitleInput     | US-19    | *      |
| E-D | component            |                    |          | *Compo |
| 6-0 |                      | -   BodyTextarea   |          | nent** |
| 2** |                      |                    |          |        |
|     |                      | -   Submit         |          |        |
|     |                      |     button +       |          |        |
|     |                      |     loading state  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Inline         |          |        |
|     |                      |     validation     |          |        |
|     |                      |     (both fields   |          |        |
|     |                      |     required)      |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build PostCard       | -   Author         | US-19,   | *      |
| E-D | component            |     avatar +       | US-20,   | *Compo |
| 6-0 |                      |     name +         | US-21    | nent** |
| 3** |                      |     timestamp      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Post title     |          |        |
|     |                      |     (bold) + body  |          |        |
|     |                      |                    |          |        |
|     |                      | -   ReplyCount     |          |        |
|     |                      |     badge          |          |        |
|     |                      |                    |          |        |
|     |                      | -   DeleteButton   |          |        |
|     |                      |     (own posts     |          |        |
|     |                      |     only)          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Expand replies |          |        |
|     |                      |     toggle         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build ReplyThread    | -   ReplyItem:     | US-20,   | *      |
| E-D | component            |     author +       | US-21    | *Compo |
| 6-0 |                      |     timestamp +    |          | nent** |
| 4** |                      |     body           |          |        |
|     |                      |                    |          |        |
|     |                      |    (chronological) |          |        |
|     |                      |                    |          |        |
|     |                      | -   Inline         |          |        |
|     |                      |                    |          |        |
|     |                      |    CreateReplyForm |          |        |
|     |                      |     at bottom of   |          |        |
|     |                      |     thread         |          |        |
|     |                      |                    |          |        |
|     |                      | -   DeleteButton   |          |        |
|     |                      |     on own replies |          |        |
|     |                      |     only           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Soft-delete    |          |        |
|     |                      |     display:       |          |        |
|     |                      |                    |          |        |
|     |                      |    \'\[deleted\]\' |          |        |
|     |                      |     placeholder if |          |        |
|     |                      |     removed        |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement delete     | -   D              | US-21    | **L    |
| E-D | flow (soft delete)   | eleteConfirmModal: |          | ogic** |
| 6-0 |                      |     \'Are you      |          |        |
| 5** |                      |     sure?\'        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Soft delete:   |          |        |
|     |                      |     replace        |          |        |
|     |                      |     content with   |          |        |
|     |                      |                    |          |        |
|     |                      |    \'\[deleted\]\' |          |        |
|     |                      |     label, keep    |          |        |
|     |                      |     thread         |          |        |
|     |                      |     structure      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Hard delete    |          |        |
|     |                      |     option for     |          |        |
|     |                      |     admin          |          |        |
|     |                      |     (separate)     |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Wire community feed  | -                  | US-19,   | **S    |
| E-D | data + pagination    |   useCommunityFeed | US-20,   | tate** |
| 6-0 |                      |     hook           | US-21    |        |
| 6** |                      |                    |          |        |
|     |                      | -   Paginate or    |          |        |
|     |                      |     infinite       |          |        |
|     |                      |     scroll         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Optimistic     |          |        |
|     |                      |     post creation  |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M5 |                      |                    |          |        |
| Mem |                      |                    |          |        |
| ber |                      |                    |          |        |
| Di  |                      |                    |          |        |
| rec |                      |                    |          |        |
| tor |                      |                    |          |        |
| y** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 6   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 24, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 25, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 26, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 27, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 28* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Scaffold Member      | -   DirectoryPage  | US-24    | **Sc   |
| *FE | Directory page       |     layout         |          | reen** |
| -MD |                      |                    |          |        |
| 6-0 |                      | -   SearchBar at   |          |        |
| 1** |                      |     top            |          |        |
|     |                      |                    |          |        |
|     |                      | -   MemberGrid /   |          |        |
|     |                      |     MemberList     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty search   |          |        |
|     |                      |     state          |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build MemberCard     | -   Avatar, name,  | US-24,   | *      |
| *FE | component            |     occupation     | US-25,   | *Compo |
| -MD |                      |                    | US-27    | nent** |
| 6-0 |                      | -   Clickable only |          |        |
| 2** |                      |     if             |          |        |
|     |                      |     profileVisible |          |        |
|     |                      |     = true         |          |        |
|     |                      |                    |          |        |
|     |                      | -   \'Private      |          |        |
|     |                      |     profile\'      |          |        |
|     |                      |     indicator if   |          |        |
|     |                      |     invisible      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Hover state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build Profile Card / | -   ProfileModal:  | US-25,   | *      |
| *FE | modal                |     full avatar,   | US-26    | *Compo |
| -MD |                      |     name,          |          | nent** |
| 6-0 |                      |     occupation,    |          |        |
| 3** |                      |     bio            |          |        |
|     |                      |                    |          |        |
|     |                      | -   SocialLinksRow |          |        |
|     |                      |     (only if       |          |        |
|     |                      |     socialsVisible |          |        |
|     |                      |     = true)        |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |  SocialLinkButton: |          |        |
|     |                      |     opens external |          |        |
|     |                      |     URL in new tab |          |        |
|     |                      |                    |          |        |
|     |                      | -   Close / back   |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Implement visibility | -   Block profile  | US-27    | **L    |
| *FE | rules (frontend      |     card open if   |          | ogic** |
| -MD | enforcement)         |     profileVisible |          |        |
| 6-0 |                      |     = false        |          |        |
| 4** |                      |                    |          |        |
|     |                      | -   Hide social    |          |        |
|     |                      |     buttons if     |          |        |
|     |                      |     socialsVisible |          |        |
|     |                      |     = false        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Show name-only |          |        |
|     |                      |     state in       |          |        |
|     |                      |     directory      |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build member search  | -   Debounced      | US-24    | **L    |
| *FE | (real-time)          |     search input   |          | ogic** |
| -MD |                      |                    |          |        |
| 6-0 |                      | -   Filter member  |          |        |
| 5** |                      |     list by name   |          |        |
|     |                      |     client-side or |          |        |
|     |                      |     API            |          |        |
|     |                      |                    |          |        |
|     |                      | -   No-results     |          |        |
|     |                      |     empty state    |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build Profile        | -                  | US-28    | **Sc   |
| *FE | Settings page (edit  |   EditProfileForm: |          | reen** |
| -MD | own profile)         |     name,          |          |        |
| 6-0 |                      |     occupation,    |          |        |
| 6** |                      |     university,    |          |        |
|     |                      |     photo          |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   EditSocialsForm: |          |        |
|     |                      |                    |          |        |
|     |                      |    add/edit/remove |          |        |
|     |                      |     social links   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Pr             |          |        |
|     |                      | ofileVisibleToggle |          |        |
|     |                      |                    |          |        |
|     |                      | -   So             |          |        |
|     |                      | cialsVisibleToggle |          |        |
|     |                      |                    |          |        |
|     |                      | -   Save changes   |          |        |
|     |                      |     button +       |          |        |
|     |                      |     success toast  |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 7 --- Development Plan & Action Center**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *M7 |                      |                    |          |        |
| De  |                      |                    |          |        |
| vel |                      |                    |          |        |
| opm |                      |                    |          |        |
| ent |                      |                    |          |        |
| Pla |                      |                    |          |        |
| n** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 7   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 39, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 40, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 41, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 42, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 43* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Scaffold Dev Plan    | -   DevPlanPage    | US-39    | **Sc   |
| *FE | page                 |     layout         |          | reen** |
| -DP |                      |                    |          |        |
| 7-0 |                      | -   PlanHeader:    |          |        |
| 1** |                      |     goal title +   |          |        |
|     |                      |     created date   |          |        |
|     |                      |                    |          |        |
|     |                      | -   MilestoneList  |          |        |
|     |                      |     section        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Add Milestone  |          |        |
|     |                      |     CTA            |          |        |
|     |                      |                    |          |        |
|     |                      | -   Empty state:   |          |        |
|     |                      |     \'No plan yet  |          |        |
|     |                      |     --- create     |          |        |
|     |                      |     one\'          |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build                | -   GoalTitleInput | US-39    | *      |
| *FE | CreateDevPlanForm    |                    |          | *Compo |
| -DP |                      | -   D              |          | nent** |
| 7-0 |                      | escriptionTextarea |          |        |
| 2** |                      |     (optional)     |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |  AddFirstMilestone |          |        |
|     |                      |     inline         |          |        |
|     |                      |     shortcut       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Save Plan      |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build MilestoneItem  | -                  | US-40,   | *      |
| *FE | component            |   MilestoneTitle + | US-41    | *Compo |
| -DP |                      |     DueDateLabel   |          | nent** |
| 7-0 |                      |                    |          |        |
| 3** |                      | -   StatusBadge:   |          |        |
|     |                      |     Pending /      |          |        |
|     |                      |     Overdue /      |          |        |
|     |                      |     Complete       |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      | MarkCompleteButton |          |        |
|     |                      |     (checkbox or   |          |        |
|     |                      |     button)        |          |        |
|     |                      |                    |          |        |
|     |                      | -   DueDatePicker  |          |        |
|     |                      |     (editable      |          |        |
|     |                      |     inline)        |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    DeleteMilestone |          |        |
|     |                      |     option         |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build                | -   TitleInput     | US-39,   | *      |
| *FE | AddMilestoneForm     |                    | US-40    | *Compo |
| -DP | (inline)             | -   DatePicker     |          | nent** |
| 7-0 |                      |     (target date)  |          |        |
| 4** |                      |                    |          |        |
|     |                      | -   Save + Cancel  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Appends to     |          |        |
|     |                      |     milestone list |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Implement            | -   PATCH          | US-41,   | **L    |
| *FE | mark-complete logic  |     milestone      | US-43    | ogic** |
| -DP |                      |     status on      |          |        |
| 7-0 |                      |     check          |          |        |
| 5** |                      |                    |          |        |
|     |                      | -   Remove from    |          |        |
|     |                      |     Action Center  |          |        |
|     |                      |     list           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Trigger \'Set  |          |        |
|     |                      |     new plan\'     |          |        |
|     |                      |     prompt if all  |          |        |
|     |                      |     milestones     |          |        |
|     |                      |     complete       |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Build \'All done\'   | -                  | US-43    | *      |
| *FE | prompt               |  CompletionBanner: |          | *Compo |
| -DP |                      |     \'You\'ve      |          | nent** |
| 7-0 |                      |     completed your |          |        |
| 6** |                      |     plan!\'        |          |        |
|     |                      |                    |          |        |
|     |                      | -   CTAs: \'Set a  |          |        |
|     |                      |     new plan\' \|  |          |        |
|     |                      |     \'Add more     |          |        |
|     |                      |     milestones\'   |          |        |
+-----+----------------------+--------------------+----------+--------+
| *   | Wire Action Center   | -                  | US-42,   | **S    |
| *FE | data to dev plan     |    useActionCenter | US-13    | tate** |
| -DP |                      |     hook: fetch    |          |        |
| 7-0 |                      |     milestones due |          |        |
| 7** |                      |     in 7 days +    |          |        |
|     |                      |     overdue        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Sort by        |          |        |
|     |                      |     urgency        |          |        |
|     |                      |     (overdue       |          |        |
|     |                      |     first)         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Link each item |          |        |
|     |                      |     to dev plan    |          |        |
|     |                      |     page           |          |        |
+-----+----------------------+--------------------+----------+--------+

**Sprint 8 --- Admin Portal**

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **  |                      |                    |          |        |
| A01 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| Sh  |                      |                    |          |        |
| ell |                      |                    |          |        |
| /   |                      |                    |          |        |
| Nav |                      |                    |          |        |
| iga |                      |                    |          |        |
| tio |                      |                    |          |        |
| n** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| All |                      |                    |          |        |
| ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| st  |                      |                    |          |        |
| ori |                      |                    |          |        |
| es* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Scaffold Admin app   | -   AdminLayout    | All      | **Sc   |
| E-A | shell                |     wrapper        | admin    | reen** |
| 8-0 |                      |     (separate from |          |        |
| 1** |                      |     member app)    |          |        |
|     |                      |                    |          |        |
|     |                      | -   AdminSideNav:  |          |        |
|     |                      |     Dashboard,     |          |        |
|     |                      |     Members,       |          |        |
|     |                      |     Events,        |          |        |
|     |                      |     Cohorts, Jobs, |          |        |
|     |                      |     Moderation,    |          |        |
|     |                      |     Analytics      |          |        |
|     |                      |                    |          |        |
|     |                      | -   TopBar with    |          |        |
|     |                      |     admin badge +  |          |        |
|     |                      |     user menu      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Role guard:    |          |        |
|     |                      |     redirect       |          |        |
|     |                      |     non-admins to  |          |        |
|     |                      |     member app     |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Admin SideNav  | -   NavItem        | All      | *      |
| E-A | with active states   |     components     | admin    | *Compo |
| 8-0 |                      |                    |          | nent** |
| 2** |                      | -   Active route   |          |        |
|     |                      |     highlight      |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    Collapse/expand |          |        |
|     |                      |     for mobile     |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **A |                      |                    |          |        |
| 2.1 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| Das |                      |                    |          |        |
| hbo |                      |                    |          |        |
| ard |                      |                    |          |        |
| O   |                      |                    |          |        |
| ver |                      |                    |          |        |
| vie |                      |                    |          |        |
| w** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 53, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 54, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 55, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 56* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Admin          | -   StatCard       | US-53,   | **Sc   |
| E-A | Dashboard overview   |     components:    | US-54,   | reen** |
| 8-0 | page                 |     Total Members, | US-55,   |        |
| 3** |                      |     Active         | US-56    |        |
|     |                      |     Members,       |          |        |
|     |                      |     Inactive       |          |        |
|     |                      |     Members        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Coho           |          |        |
|     |                      | rtEngagementTable: |          |        |
|     |                      |     posts,         |          |        |
|     |                      |     replies, RSVPs |          |        |
|     |                      |     per cohort     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Date range     |          |        |
|     |                      |     selector for   |          |        |
|     |                      |     engagement     |          |        |
|     |                      |     filter         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build StatCard       | -   Large number   | US-53,   | *      |
| E-A | component            |     display        | US-54,   | *Compo |
| 8-0 |                      |                    | US-55    | nent** |
| 4** |                      | -   Label +        |          |        |
|     |                      |     definition     |          |        |
|     |                      |     tooltip        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Trend          |          |        |
|     |                      |     indicator      |          |        |
|     |                      |     (optional)     |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *A3 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| M   |                      |                    |          |        |
| emb |                      |                    |          |        |
| ers |                      |                    |          |        |
| Man |                      |                    |          |        |
| age |                      |                    |          |        |
| men |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 44, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 45, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 46, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 47, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 48* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Members List   | -   MembersTable:  | US-44,   | **Sc   |
| E-A | page                 |     name, email,   | US-45    | reen** |
| 8-0 |                      |     joined date,   |          |        |
| 5** |                      |     status badge   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Search +       |          |        |
|     |                      |     filter by      |          |        |
|     |                      |     status (Active |          |        |
|     |                      |     / Suspended)   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Pagination     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Bulk select    |          |        |
|     |                      |     checkbox       |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Add Single     | -   EmailInput     | US-44    | *      |
| E-A | Member modal         |                    |          | *Compo |
| 8-0 |                      | -   Send invite    |          | nent** |
| 6** |                      |     option         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit +       |          |        |
|     |                      |     success toast  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Bulk Add       | -   TabBar: CSV    | US-45    | *      |
| E-A | Members modal        |     Upload \|      |          | *Compo |
| 8-0 |                      |     Paste Emails   |          | nent** |
| 7** |                      |                    |          |        |
|     |                      | -   CSVDropzone    |          |        |
|     |                      |     with file      |          |        |
|     |                      |     validation     |          |        |
|     |                      |                    |          |        |
|     |                      | -   EmailTextarea  |          |        |
|     |                      |     (line/comma    |          |        |
|     |                      |     separated)     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Process button |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    ResultsSummary: |          |        |
|     |                      |     \'X added, Y   |          |        |
|     |                      |     failed\' with  |          |        |
|     |                      |     invalid email  |          |        |
|     |                      |     list           |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build member action  | -   DropdownMenu:  | US-46,   | *      |
| E-A | menu (per row)       |     Suspend \|     | US-47,   | *Compo |
| 8-0 |                      |     Send Warning   | US-48    | nent** |
| 8** |                      |     \| Remove      |          |        |
|     |                      |                    |          |        |
|     |                      | -   S              |          |        |
|     |                      | uspendConfirmModal |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      | RemoveConfirmModal |          |        |
|     |                      |     (hard delete   |          |        |
|     |                      |     warning)       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Reinstate      |          |        |
|     |                      |     action for     |          |        |
|     |                      |     suspended      |          |        |
|     |                      |     members        |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement send       | -   WarningForm:   | US-48    | **L    |
| E-A | warning flow         |     textarea for   |          | ogic** |
| 8-0 |                      |     warning        |          |        |
| 9** |                      |     message        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit → POST  |          |        |
|     |                      |     to             |          |        |
|     |                      |     notifications  |          |        |
|     |                      |     API            |          |        |
|     |                      |                    |          |        |
|     |                      | -   Success toast: |          |        |
|     |                      |     \'Warning      |          |        |
|     |                      |     sent\'         |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *A4 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| C   |                      |                    |          |        |
| oho |                      |                    |          |        |
| rts |                      |                    |          |        |
| Man |                      |                    |          |        |
| age |                      |                    |          |        |
| men |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 35, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 36, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 37, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 38* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Cohorts List   | -                  | US-35    | **Sc   |
| E-A | page                 |    CohortListItem: |          | reen** |
| 8-1 |                      |     name, member   |          |        |
| 0** |                      |     count, created |          |        |
|     |                      |     date           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Create New     |          |        |
|     |                      |     Cohort button  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Click → cohort |          |        |
|     |                      |     detail page    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Create Cohort  | -   NameInput      | US-35    | *      |
| E-A | modal / form         |                    |          | *Compo |
| 8-1 |                      | -   D              |          | nent** |
| 1** |                      | escriptionTextarea |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit +       |          |        |
|     |                      |     redirect to    |          |        |
|     |                      |     cohort detail  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Cohort Detail  | -                  | US-35,   | **Sc   |
| E-A | page (admin)         |  CohortDetailTabs: | US-36,   | reen** |
| 8-1 |                      |     Members \|     | US-37,   |        |
| 2** |                      |     Resources \|   | US-38    |        |
|     |                      |     Sessions \|    |          |        |
|     |                      |     Recordings \|  |          |        |
|     |                      |     Announcements  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Cohort name +  |          |        |
|     |                      |     description    |          |        |
|     |                      |     header + Edit  |          |        |
|     |                      |     option         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Add Members to | -   Reuse Bulk Add | US-36    | *      |
| E-A | Cohort panel         |     Members        |          | *Compo |
| 8-1 |                      |     component      |          | nent** |
| 3** |                      |     (CSV + paste)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   ResultsSummary |          |        |
|     |                      |     with invalid   |          |        |
|     |                      |     email report   |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Upload         | -   ResourceForm:  | US-37    | *      |
| E-A | Resources panel      |     title + URL    |          | *Compo |
| 8-1 |                      |                    |          | nent** |
| 4** |                      | -   ResourceList   |          |        |
|     |                      |     with delete    |          |        |
|     |                      |     option         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Add Recording  | -   RecordingForm: | US-37,   | *      |
| E-A | to Cohort            |     title +        | US-52    | *Compo |
| 8-1 |                      |     YouTube URL    |          | nent** |
| 5** |                      |                    |          |        |
|     |                      | -   Auto-preview   |          |        |
|     |                      |     thumbnail on   |          |        |
|     |                      |     URL input      |          |        |
|     |                      |                    |          |        |
|     |                      | -   RecordingList  |          |        |
|     |                      |     with delete    |          |        |
|     |                      |     option         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Send           | -   An             | US-38    | *      |
| E-A | Announcement form    | nouncementTextarea |          | *Compo |
| 8-1 |                      |                    |          | nent** |
| 6** |                      | -   Preview card   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit → posts |          |        |
|     |                      |     to cohort      |          |        |
|     |                      |     feed +         |          |        |
|     |                      |     triggers       |          |        |
|     |                      |     notifications  |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *A5 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| Eve |                      |                    |          |        |
| nts |                      |                    |          |        |
| Man |                      |                    |          |        |
| age |                      |                    |          |        |
| men |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 49, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 50, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 51, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 52* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Events List    | -   EventsTable:   | US-49,   | **Sc   |
| E-A | page (admin)         |     name, date,    | US-51    | reen** |
| 8-1 |                      |     audience, RSVP |          |        |
| 7** |                      |     count          |          |        |
|     |                      |                    |          |        |
|     |                      | -   Create New     |          |        |
|     |                      |     Event button   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Filter by      |          |        |
|     |                      |     upcoming/past  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Create / Edit  | -   EventNameInput | US-49,   | *      |
| E-A | Event form           |                    | US-50    | *Compo |
| 8-1 |                      | -   DateTimePicker |          | nent** |
| 8** |                      |                    |          |        |
|     |                      | -   HostNameInput  |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |    MeetingURLInput |          |        |
|     |                      |     (validated)    |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |  AudienceSelector: |          |        |
|     |                      |     Community-wide |          |        |
|     |                      |     \| Specific    |          |        |
|     |                      |     Cohort \|      |          |        |
|     |                      |     Specific       |          |        |
|     |                      |     Individuals    |          |        |
|     |                      |                    |          |        |
|     |                      | -   CohortDropdown |          |        |
|     |                      |     (conditional)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Ind            |          |        |
|     |                      | ividualEmailSearch |          |        |
|     |                      |     (conditional)  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit +       |          |        |
|     |                      |     success        |          |        |
|     |                      |     redirect       |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Event Detail + | -                  | US-51,   | **Sc   |
| E-A | RSVP List view       |   EventDetailCard: | US-52    | reen** |
| 8-1 |                      |     all event      |          |        |
| 9** |                      |     fields         |          |        |
|     |                      |                    |          |        |
|     |                      | -   RSVPTable:     |          |        |
|     |                      |     member name,   |          |        |
|     |                      |     status,        |          |        |
|     |                      |     timestamp      |          |        |
|     |                      |                    |          |        |
|     |                      | -   RSVP count     |          |        |
|     |                      |     summary        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Add Recording  |          |        |
|     |                      |     link button    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Add Recording  | -   R              | US-52    | *      |
| E-A | link to event        | ecordingURLInput + |          | *Compo |
| 8-2 |                      |     title          |          | nent** |
| 0** |                      |                    |          |        |
|     |                      | -   YouTube        |          |        |
|     |                      |     thumbnail      |          |        |
|     |                      |     preview        |          |        |
|     |                      |                    |          |        |
|     |                      | -   Save →         |          |        |
|     |                      |     attaches to    |          |        |
|     |                      |     event          |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **A |                      |                    |          |        |
| 6.1 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| J   |                      |                    |          |        |
| obs |                      |                    |          |        |
| Man |                      |                    |          |        |
| age |                      |                    |          |        |
| men |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 17, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 18* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Jobs List page | -   JobsTable:     | US-17,   | **Sc   |
| E-A | (admin)              |     title,         | US-18    | reen** |
| 8-2 |                      |     company,       |          |        |
| 1** |                      |     referral flag, |          |        |
|     |                      |     posted date    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Create New Job |          |        |
|     |                      |     button         |          |        |
|     |                      |                    |          |        |
|     |                      | -   View referral  |          |        |
|     |                      |     requests per   |          |        |
|     |                      |     job            |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Create / Edit  | -   TitleInput,    | US-17    | *      |
| E-A | Job form             |     CompanyInput,  |          | *Compo |
| 8-2 |                      |     LocationInput  |          | nent** |
| 2** |                      |                    |          |        |
|     |                      | -   D              |          |        |
|     |                      | escriptionTextarea |          |        |
|     |                      |                    |          |        |
|     |                      | -                  |          |        |
|     |                      |   ExternalURLInput |          |        |
|     |                      |     (validated)    |          |        |
|     |                      |                    |          |        |
|     |                      | -   Refer          |          |        |
|     |                      | ralAvailableToggle |          |        |
|     |                      |                    |          |        |
|     |                      | -   Referr         |          |        |
|     |                      | alContactNameInput |          |        |
|     |                      |     (conditional   |          |        |
|     |                      |     on toggle)     |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit +       |          |        |
|     |                      |     success toast  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Referral       | -   Ref            | US-18    | *      |
| E-A | Requests panel       | erralRequestTable: |          | *Compo |
| 8-2 |                      |     member name,   |          | nent** |
| 3** |                      |     email,         |          |        |
|     |                      |     timestamp      |          |        |
|     |                      |                    |          |        |
|     |                      | -   StatusSelect   |          |        |
|     |                      |     per request:   |          |        |
|     |                      |     New \|         |          |        |
|     |                      |     Contacted \|   |          |        |
|     |                      |     Closed         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Export list    |          |        |
|     |                      |     option         |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| *   |                      |                    |          |        |
| *A7 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| Mod |                      |                    |          |        |
| era |                      |                    |          |        |
| tio |                      |                    |          |        |
| n** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 22, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 23* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Moderation     | -   M              | US-22    | **Sc   |
| E-A | view (community +    | oderationFeedView: |          | reen** |
| 8-2 | cohort feeds)        |     combined       |          |        |
| 4** |                      |     post/reply     |          |        |
|     |                      |     list           |          |        |
|     |                      |                    |          |        |
|     |                      | -   FilterBar:     |          |        |
|     |                      |     Community \|   |          |        |
|     |                      |     Cohort         |          |        |
|     |                      |     selector       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Each post      |          |        |
|     |                      |     shows author,  |          |        |
|     |                      |     content,       |          |        |
|     |                      |     timestamp,     |          |        |
|     |                      |     Delete button  |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build admin delete   | -   Admin          | US-22    | **L    |
| E-A | flow for any         |     DeleteButton   |          | ogic** |
| 8-2 | post/reply           |     on all         |          |        |
| 5** |                      |     posts/replies  |          |        |
|     |                      |                    |          |        |
|     |                      | -   Immediate      |          |        |
|     |                      |     removal (no    |          |        |
|     |                      |     confirm        |          |        |
|     |                      |     required for   |          |        |
|     |                      |     admin, or      |          |        |
|     |                      |     optional       |          |        |
|     |                      |     confirm)       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Soft delete    |          |        |
|     |                      |     display for    |          |        |
|     |                      |     thread         |          |        |
|     |                      |     integrity      |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Send Warning   | -                  | US-23    | *      |
| E-A | to member flow       |   WarnMemberModal: |          | *Compo |
| 8-2 |                      |     member name +  |          | nent** |
| 6** |                      |     warning        |          |        |
|     |                      |     message        |          |        |
|     |                      |     textarea       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Submit →       |          |        |
|     |                      |     notification   |          |        |
|     |                      |     sent to member |          |        |
|     |                      |                    |          |        |
|     |                      | -   Success        |          |        |
|     |                      |     confirmation   |          |        |
+-----+----------------------+--------------------+----------+--------+

+-----+----------------------+--------------------+----------+--------+
| **T | **Task / Issue**     | **UI Components to | **Linked | **     |
| ask |                      | Build**            | S        | Type** |
| I   |                      |                    | tories** |        |
| D** |                      |                    |          |        |
+=====+======================+====================+==========+========+
| **A |                      |                    |          |        |
| 8.1 |                      |                    |          |        |
| Ad  |                      |                    |          |        |
| min |                      |                    |          |        |
| --- |                      |                    |          |        |
| Ana |                      |                    |          |        |
| lyt |                      |                    |          |        |
| ics |                      |                    |          |        |
| &   |                      |                    |          |        |
| Ex  |                      |                    |          |        |
| por |                      |                    |          |        |
| t** |                      |                    |          |        |
| Spr |                      |                    |          |        |
| int |                      |                    |          |        |
| 8   |                      |                    |          |        |
| *   |                      |                    |          |        |
| US- |                      |                    |          |        |
| 53, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 54, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 55, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 56, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 57, |                      |                    |          |        |
| US- |                      |                    |          |        |
| 58* |                      |                    |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build Analytics page | -   AnalyticsPage  | US-53,   | **Sc   |
| E-A | (full)               |     layout         | US-54,   | reen** |
| 8-2 |                      |                    | US-55,   |        |
| 7** |                      | -   StatCards row: | US-56    |        |
|     |                      |     Total, Active, |          |        |
|     |                      |     Inactive       |          |        |
|     |                      |                    |          |        |
|     |                      | -   Coh            |          |        |
|     |                      | ortEngagementTable |          |        |
|     |                      |     with date      |          |        |
|     |                      |     range filter   |          |        |
|     |                      |                    |          |        |
|     |                      | -   Export         |          |        |
|     |                      |     buttons: Excel |          |        |
|     |                      |     \| PDF         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement Excel      | -   Trigger API    | US-57    | **L    |
| E-A | export               |     export         |          | ogic** |
| 8-2 |                      |     endpoint       |          |        |
| 8** |                      |                    |          |        |
|     |                      | -   Download .xlsx |          |        |
|     |                      |     file via blob  |          |        |
|     |                      |     URL            |          |        |
|     |                      |                    |          |        |
|     |                      | -   Loading state  |          |        |
|     |                      |     on export      |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Implement PDF export | -   Trigger API    | US-58    | **L    |
| E-A |                      |     export         |          | ogic** |
| 8-2 |                      |     endpoint or    |          |        |
| 9** |                      |     use print      |          |        |
|     |                      |     layout         |          |        |
|     |                      |                    |          |        |
|     |                      | -   Download .pdf  |          |        |
|     |                      |     file           |          |        |
|     |                      |                    |          |        |
|     |                      | -   Loading state  |          |        |
|     |                      |     on export      |          |        |
|     |                      |     button         |          |        |
+-----+----------------------+--------------------+----------+--------+
| **F | Build date range     | -                  | US-56    | *      |
| E-A | filter for analytics |    DateRangePicker |          | *Compo |
| 8-3 |                      |     component      |          | nent** |
| 0** |                      |     (start date +  |          |        |
|     |                      |     end date)      |          |        |
|     |                      |                    |          |        |
|     |                      | -   Apply filter → |          |        |
|     |                      |     refresh cohort |          |        |
|     |                      |     engagement     |          |        |
|     |                      |     data           |          |        |
+-----+----------------------+--------------------+----------+--------+

**Global / Shared Components**

These components are reused across multiple screens and should be built
in Sprint 1 alongside auth.

  --------------------------------------------------------------------------------
  **Task ID**   **Component**             **Used in**              **Type**
  ------------- ------------------------- ------------------------ ---------------
  **FE-G-01**   Toast / Snackbar          All screens on form      **Component**
                notification (success,    submit / action feedback 
                error, info)                                       

  **FE-G-02**   ConfirmModal (generic     Delete post, suspend     **Component**
                \'Are you sure?\' dialog) member, remove member    

  **FE-G-03**   EmptyState component      All list/feed views when **Component**
                (icon + message +         data is empty            
                optional CTA)                                      

  **FE-G-04**   SkeletonLoader (card,     Dashboard, Jobs,         **Component**
                list, table variants)     Directory, Cohort tabs   
                                          on load                  

  **FE-G-05**   ErrorBoundary (per        All data-fetching        **Component**
                section fallback UI)      sections                 

  **FE-G-06**   AvatarInitials (fallback  Member directory, posts, **Component**
                when no photo uploaded)   event cards              

  **FE-G-07**   StatusBadge (colour-coded Admin members table,     **Component**
                pill: Active, Suspended,  milestone items          
                etc.)                                              

  **FE-G-08**   DatePicker (shared,       Dev Plan milestone       **Component**
                accessible)               dates, event creation    

  **FE-G-09**   Global API error          All authenticated API    **Logic**
                handling + 401 redirect   calls → redirect to      
                                          /auth if session expired 

  **FE-G-10**   Responsive breakpoint     All screens --- mobile / **Style**
                system (Tailwind config)  tablet / desktop         
  --------------------------------------------------------------------------------

**Task Summary**

  ----------------------------------- ----------------- -----------------
  **Area**                            **Screens**       **Tasks**

  Auth & Onboarding (Sprint 1)        2                 16

  Member App Shell (Sprint 2)         1                 5

  Dashboard & Events (Sprint 2)       1                 7

  Cohorts / Groups (Sprint 3)         1                 8

  Recordings (Sprint 4)               1                 4

  Jobs & Referral (Sprint 5)          1                 6

  Community Discussion (Sprint 6)     1                 6

  Member Directory (Sprint 6)         1                 6

  Development Plan (Sprint 7)         1                 7

  Admin Portal (Sprint 8)             8                 28

  Global / Shared Components          ---               10

  **TOTAL**                           **19**            **103**
  ----------------------------------- ----------------- -----------------

*--- End of Document ---*