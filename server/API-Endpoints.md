# API Endpoints Documentation

Checklist| Method | Path | Controller | Handler | Guards |
|--------|--------|------|------------|---------|--------|
[]| POST | /posts | PostController | create | JwtAuthGuard |
[]| GET | /posts | PostController | findAll | - |
[]| GET | /posts/:id | PostController | findOne | - |
[]| PUT | /posts/:id | PostController | update | JwtAuthGuard |
[]| DELETE | /posts/:id | PostController | remove | JwtAuthGuard |
[]| POST | /comments | CommentController | create | JwtAuthGuard |
[]| GET | /comments | CommentController | findByPostId | - |
[]| DELETE | /comments/:id | CommentController | remove | JwtAuthGuard |
[]| POST | /auth/login | AuthController | login | - |
[]| GET | /auth/profile | AuthController | getProfile | JwtAuthGuard |
[]| GET | /auth/google | AuthController | googleAuth | AuthGuard('google') |
[]| GET | /auth/google/callback | AuthController | googleAuthRedirect | AuthGuard('google') |
[]| GET | /auth/microsoft | AuthController | microsoftAuth | AuthGuard('microsoft') |
[]| GET | /auth/microsoft/callback | AuthController | microsoftAuthRedirect | AuthGuard('microsoft') |
[]| GET | /users | UserController | findAll | JwtAuthGuard, RolesGuard(ADMIN) |
[]| GET | /users/:id | UserController | findOne | JwtAuthGuard, RolesGuard(ADMIN, BOD) |
[]| GET | /users/profile | UserController | getProfile | JwtAuthGuard |
[]| PUT | /users/profile | UserController | updateProfile | JwtAuthGuard |
[]| DELETE | /users/:id | UserController | remove | JwtAuthGuard, RolesGuard(ADMIN) |
[]| PUT | /users/:id/role | UserController | updateRole | JwtAuthGuard, RolesGuard(ADMIN) |
[]| PUT | /users/:id/status | UserController | updateStatus | JwtAuthGuard, RolesGuard(ADMIN, BOD) |
[]| POST | /likes | LikeController | create | JwtAuthGuard |
[]| DELETE | /likes/:id | LikeController | remove | JwtAuthGuard |
[]| GET | /likes | LikeController | findByPostId | JwtAuthGuard |
[]| POST | /events | EventController | create | JwtAuthGuard |
[]| GET | /events | EventController | findAll | RolesGuard(BOD) |
[]| GET | /events/:id | EventController | findOne | RolesGuard(BOD) |
[]| PUT | /events/:id | EventController | update | RolesGuard(BOD) |
[]| POST | /events/:id/register | EventController | register | JwtAuthGuard |
[]| GET | /events/:id/participants | EventController | getParticipants | JwtAuthGuard |
[]| GET | /notifications | NotificationController | findAll | JwtAuthGuard |
[]| POST | /library | LibraryController | upload | JwtAuthGuard |
[x]| GET | /library | LibraryController | findAll | RolesGuard(BOD) |
[x]| GET | /library/:id | LibraryController | findOne | RolesGuard(BOD) |
[]| PUT | /library/:id | LibraryController | update | RolesGuard(BOD) |
[]| DELETE | /library/:id | LibraryController | remove | RolesGuard(BOD) |
[]| POST | /library/:id/approve | LibraryController | approve | RolesGuard(BOD) |
[]| GET | /library/my | LibraryController | findMyResources | RolesGuard(BOD) | 
[]| GET | /stats/recent-records | StatsController | getRecentRecords | JwtAuthGuard, RolesGuard(ADMIN, BOD) |
[]| GET | /stats/monthly-comparison | StatsController | getMonthlyStats | JwtAuthGuard, RolesGuard(ADMIN, BOD) |
[]| GET | /stats/combined | StatsController | getCombinedStats | JwtAuthGuard, RolesGuard(ADMIN, BOD) |

## Stats Endpoints

### GET /stats/recent-records
- **Description**: Truy xuất 5 bản ghi mới nhất từ mỗi model (User, Post, Event, Permission)
- **Guards**: JwtAuthGuard, RolesGuard(ADMIN, BOD)
- **Response**: RecentRecordsDto containing arrays of latest records

### GET /stats/monthly-comparison  
- **Description**: So sánh số lượng bản ghi tháng hiện tại vs tháng trước
- **Guards**: JwtAuthGuard, RolesGuard(ADMIN, BOD)
- **Response**: MonthlyStatsDto with counts and percentage changes

### GET /stats/combined
- **Description**: API tổng hợp trả về cả recent records và monthly stats
- **Guards**: JwtAuthGuard, RolesGuard(ADMIN, BOD)
- **Response**: CombinedStatsDto containing both datasets 