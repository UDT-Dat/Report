# UI Component Analysis

## Missing Pages and Components

### Posts
- **Missing:** Post detail page
  - **Location:** `client/app/posts/[id]/page.tsx`
  - **APIs used:** GET `/posts/:id`, PUT `/posts/:id`, DELETE `/posts/:id`
  - **Guards:** Some actions require JwtAuthGuard

- **Missing:** Post list page 
  - **Location:** `client/app/posts/page.tsx`
  - **APIs used:** GET `/posts`

### Comments
- **Missing:** Comment components 
  - **Location:** `client/components/comment-section.tsx`
  - **APIs used:** POST `/comments`, GET `/comments`, DELETE `/comments/:id`
  - **Guards:** Creating/deleting requires JwtAuthGuard

### Auth
- **Missing:** Login page
  - **Location:** `client/app/auth/login/page.tsx`
  - **APIs used:** POST `/auth/login`

- **Missing:** Auth callback pages
  - **Location:** 
    - `client/app/auth/google/callback/page.tsx`
    - `client/app/auth/microsoft/callback/page.tsx`
  - **APIs used:** GET `/auth/google/callback`, GET `/auth/microsoft/callback`

### Users
- **Missing:** User role management
  - **Location:** `client/app/admin/users/roles/page.tsx`
  - **APIs used:** PUT `/users/:id/role`
  - **Guards:** JwtAuthGuard, RolesGuard(ADMIN)

- **Missing:** User status management
  - **Location:** `client/app/admin/users/status/page.tsx`
  - **APIs used:** PUT `/users/:id/status`
  - **Guards:** JwtAuthGuard, RolesGuard(ADMIN, BOD)

### Likes
- **Missing:** Like component
  - **Location:** `client/components/like-button.tsx`
  - **APIs used:** POST `/likes`, DELETE `/likes/:id`, GET `/likes`
  - **Guards:** JwtAuthGuard

### Events
- **Missing:** Event registration component
  - **Location:** `client/components/event-registration.tsx`
  - **APIs used:** POST `/events/:id/register`
  - **Guards:** JwtAuthGuard

- **Missing:** Event participants list
  - **Location:** `client/app/bod/events/[id]/participants/page.tsx`
  - **APIs used:** GET `/events/:id/participants`
  - **Guards:** JwtAuthGuard

### Notifications
- **Missing:** Notifications page
  - **Location:** `client/app/notifications/page.tsx`
  - **APIs used:** GET `/notifications`
  - **Guards:** JwtAuthGuard

### Library
- **Missing:** Library detail page
  - **Location:** `client/app/library/[id]/page.tsx`
  - **APIs used:** GET `/library/:id`, PUT `/library/:id`, DELETE `/library/:id`
  - **Guards:** RolesGuard(BOD)

- **Missing:** Library approval UI
  - **Location:** `client/app/bod/library/approval/page.tsx`
  - **APIs used:** POST `/library/:id/approve`
  - **Guards:** RolesGuard(BOD)

- **Missing:** My library resources
  - **Location:** `client/app/library/my/page.tsx`
  - **APIs used:** GET `/library/my`
  - **Guards:** RolesGuard(BOD)

## Improvements for Existing Pages

### app/admin/users/page.tsx
- Add role management functionality
- Add status management functionality
- Connect to API endpoints: GET `/users`, PUT `/users/:id/role`, PUT `/users/:id/status`

### app/bod/events/page.tsx
- Add event creation and update functionality
- Add link to participants list
- Connect to API endpoints: POST `/events`, PUT `/events/:id`

### app/events/[id]/page.tsx
- Add registration functionality
- Connect to API endpoints: POST `/events/:id/register`

### app/library/page.tsx
- Add upload functionality
- Connect to API endpoints: POST `/library`
- Add approval workflow for BOD users

### app/profile/[username]/page.tsx
- Enhance with user profile editing
- Connect to API endpoints: PUT `/users/profile`

### app/my-draft/page.tsx
- Connect to post creation/editing APIs
- Connect to API endpoints: POST `/posts`, PUT `/posts/:id` 