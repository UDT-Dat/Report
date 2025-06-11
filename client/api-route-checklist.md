# API Route Checklist

This document provides a checklist of implemented and missing pages in relation to API endpoints.

## Implemented Pages and Routes

| Page Route | Allowed Roles | Status | Related API Endpoints |
|------------|--------------|--------|----------------------|
| `/admin/users` | Admin | ✅ Implemented | GET /users, DELETE /users/:id, PUT /users/:id/role, PUT /users/:id/status |
| `/profile` | Admin, BOD, Member | ✅ Implemented | GET /users/profile, PUT /users/profile |
| `/profile/[username]` | Admin, BOD, Member | ✅ Implemented | GET /users/:id |
| `/account/personal-details` | Admin, BOD, Member | ✅ Implemented | PUT /users/profile |
| `/events` | Admin, BOD, Member | ✅ Implemented | GET /events |
| `/events/[id]` | Admin, BOD, Member | ✅ Implemented | GET /events/:id, POST /events/:id/register |
| `/library` | Admin, BOD, Member | ✅ Implemented | GET /library, GET /library/:id, POST /library |
| `/editorv2/create/[id]` | Admin, BOD, Member | ✅ Implemented | POST /posts, PUT /posts/:id |
| `/my-draft` | Admin, BOD, Member | ✅ Implemented | GET /posts |
| `/bod/events` | Admin, BOD | ✅ Implemented | POST /events, GET /events, PUT /events/:id |

## Missing Pages and Routes

| Page Route | Recommended Roles | Status | Related API Endpoints |
|------------|------------------|--------|----------------------|
| `/admin/posts` | Admin | ❌ Missing | GET /posts, PUT /posts/:id, DELETE /posts/:id |
| `/admin/comments` | Admin | ❌ Missing | GET /comments, DELETE /comments/:id |
| `/admin/events` | Admin, BOD | ❌ Missing | GET /events, POST /events, PUT /events/:id, GET /events/:id/participants |
| `/admin/library` | Admin, BOD | ❌ Missing | GET /library, PUT /library/:id, DELETE /library/:id, POST /library/:id/approve |
| `/posts/[id]/comments` | Admin, BOD, Member | ❌ Missing | GET /comments, POST /comments |
| `/posts/[id]/like` | Admin, BOD, Member | ❌ Missing | POST /likes, DELETE /likes/:id |
| `/notifications` | Admin, BOD, Member | ❌ Missing | GET /notifications |
| `/library/my` | Admin, BOD, Member | ❌ Missing | GET /library/my |

