# Clean Water and Sanitation

This repository contains a full-stack assignment project for the **SE3040 Application Frameworks** module. The application is focused on clean water and sanitation related workflows, including user account management, restroom information, issue reporting, staff support, and admin management features.

This README is written to match the current codebase and the assignment submission requirements.

## Project Overview

The project is organized into two applications:

- `frontend/` - React frontend built with Vite
- `backend/` - Express.js REST API with MongoDB

The current implementation includes:

- user registration, login, and email verification
- user profile management
- admin management pages
- staff-related dashboards and workflows
- restroom browsing and location-based data
- issue / complaint reporting
- contact support handling

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Leaflet / React Leaflet

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Zod validation
- Nodemailer
- Cloudinary
- Multer

## Repository Structure

```text
Clean-water-and-sanitation/
|-- frontend/
|   |-- src/
|   |-- package.json
|   `-- .env
|-- backend/
|   |-- src/
|   `-- package.json
`-- README.md
```

## Main Features

- Authentication and authorization
- User registration and login
- Email verification
- User profile view and edit
- Staff profile and work-related pages
- Admin dashboard and admin user management
- Restroom browsing and related data views
- Complaint / issue reporting flows
- Contact form support

## Main Frontend Routes

- `/` - home page
- `/login` or `/auth/login` - login page
- `/register` or `/auth/register` - registration page
- `/verify-email` or `/auth/verify-email` - email verification page
- `/profile` - user profile area
- `/rest-rooms` - restroom map / listing page
- `/complaints/report` - complaint reporting page
- `/my-complaints` - logged-in user complaint history
- `/admin/dashboard` - admin dashboard
- `/admin/users` - admin user management
- `/staff/dashboard` - staff dashboard
- `/staff/profile` - staff profile page

## Backend API Base

All backend routes are mounted under:

```text
/api
```

Main route groups:

- `/api/auth`
- `/api/users`
- `/api/staff`
- `/api/restrooms`
- `/api/issues`
- `/api/categories`
- `/api/locations`
- `/api/contact`

## Environment Variables

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

The frontend also includes a fallback API URL in [frontend/src/config/api.js](/abs/path/c:/Clean-water-and-sanitation/frontend/src/config/api.js:1).

### Backend

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
CONTACT_RECEIVER_EMAIL=optional_receiver_email
```

## Setup Instructions

### 1. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Run the backend

```bash
cd backend
npm run dev
```

Default backend URL:

```text
http://localhost:5001
```

### 3. Run the frontend

```bash
cd frontend
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

### 4. Open the application

- `http://localhost:5173/`
- `http://localhost:5173/login`
- `http://localhost:5173/register`
- `http://localhost:5173/admin/dashboard`

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm start
npm run seed:locations
```

## API Endpoint Documentation

This project includes multiple endpoint groups. The summary below gives a submission-level overview. A complete Postman collection or Swagger documentation should be included separately if required by the evaluation.

### Authentication

- `POST /api/auth/login`
  - Description: authenticate a user and return login data / token
  - Auth: public

### User Management

- `POST /api/users`
  - Description: register a new user profile
  - Auth: public
- `GET /api/users/me`
  - Description: get current logged-in user profile
  - Auth: bearer token required
- `PUT /api/users/me`
  - Description: update current logged-in user profile
  - Auth: bearer token required
- `DELETE /api/users/me`
  - Description: delete current logged-in user profile
  - Auth: bearer token required

### Staff

- `/api/staff`
  - Description: staff-related routes, profile handling, and staff-specific actions
  - Auth: protected, role-based

### Restrooms

- `/api/restrooms`
  - Description: restroom-related CRUD and viewing endpoints
  - Auth: depends on operation

### Issues / Complaints

- `/api/issues`
  - Description: complaint and issue reporting endpoints
  - Auth: protected for user-specific operations

### Categories

- `/api/categories`
  - Description: issue category management endpoints
  - Auth: admin / protected as required

### Locations

- `/api/locations`
  - Description: location lookup endpoints for country / province / district / city data

### Contact

- `POST /api/contact`
  - Description: submit contact/support requests
  - Auth: public

### Request / Response Notes

- JSON is the default request / response format for most endpoints.
- Some endpoints support `multipart/form-data` for file uploads.
- Protected endpoints require a bearer token in the `Authorization` header.

### Example Authenticated Request

```http
GET /api/users/me
Authorization: Bearer <token>
```

### Example JSON Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

### Example JSON Response

```json
{
  "message": "Request successful",
  "user": {
    "id": "sample-id",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## API Screenshots

<details>
<summary>Restroom Management — API Results (click to expand)</summary>

### GET /api/restrooms — Get all restrooms
![Get all restrooms](public/Restroom-Management/API/get%20all%20public%20toilets.png)

### GET /api/restrooms/nearby — Get nearby restrooms
![Get nearby restrooms](public/Restroom-Management/API/get%20nearby%20toilets.png)

### GET /api/restrooms/nearby — Missing lat/lng (400 error)
![Nearby validation error](public/Restroom-Management/API/get%20nearby%20toilets%20lat%20and%20lng%20are%20required.png)

### GET /api/restrooms/:id — Get restroom by ID
![Get restroom by ID](public/Restroom-Management/API/get%20toilets%20by%20ID.png)

### POST /api/restrooms — Create restroom (Admin)
![Create restroom](public/Restroom-Management/API/create%20restroom.png)

### PUT /api/restrooms/:id — Update restroom (Admin)
![Update restroom](public/Restroom-Management/API/update%20restroom.png)

### DELETE /api/restrooms/:id — Delete restroom (Admin)
![Delete restroom](public/Restroom-Management/API/delete%20restroom.png)

### POST /api/restrooms/:id/rate — Submit rating
![Restroom rating](public/Restroom-Management/API/restroom%20rating.png)

</details>

<details>
<summary>User Management — API Results (click to expand)</summary>

> Screenshots to be added by User Management team member.

</details>

<details>
<summary>Issue Reporting — API Results (click to expand)</summary>

> Screenshots to be added by Issue Reporting team member.

</details>

<details>
<summary>Staff Management — API Results (click to expand)</summary>

> Screenshots to be added by Staff Management team member.

</details>

## Test Screenshots

<details>
<summary>Restroom Management — Test Results (click to expand)</summary>

### Packages installed
![Packages installed](public/Restroom-Management/TEST/terminal%20packages%20installed%20image.png)

### Performance test packages installed
![Performance packages](public/Restroom-Management/TEST/performance%20testing%20package%20install%20image.png)

### Unit tests — summary
![Unit test summary](public/Restroom-Management/TEST/summary%20of%20unit%20testing.png)

### Integration tests — summary
![Integration test summary](public/Restroom-Management/TEST/summary%20of%20inegration%20testing.png)

### All tests combined (unit + integration)
![All tests](public/Restroom-Management/TEST/all%20test%28unit%20%2B%20integration%29%20.png)

### Performance test — part 1
![Performance test p1](public/Restroom-Management/TEST/performance%20testing%20p1.png)

### Performance test — part 2
![Performance test p2](public/Restroom-Management/TEST/performance%20testing%20p2.png)

</details>

<details>
<summary>User Management — Test Results (click to expand)</summary>

> Screenshots to be added by User Management team member.

</details>

<details>
<summary>Issue Reporting — Test Results (click to expand)</summary>

> Screenshots to be added by Issue Reporting team member.

</details>

<details>
<summary>Staff Management — Test Results (click to expand)</summary>

> Screenshots to be added by Staff Management team member.

</details>

## Session Management

- JWT-based authentication is used for protected backend routes.
- The frontend stores authentication data locally and uses protected route logic for access control.
- Role-based behavior is implemented for user, staff, and admin areas.

## Deployment

This section is required by the assignment and should be finalized before submission.

### Backend Deployment

Recommended platforms:

- Render
- Railway

Suggested backend deployment steps:

1. Create a new web service.
2. Connect the backend repository / project.
3. Set the root directory to `backend/` if needed.
4. Add required environment variables.
5. Set the start command:

```bash
npm start
```

6. Deploy and verify API endpoints.

### Frontend Deployment

Recommended platforms:

- Vercel
- Netlify
- Firebase Hosting

Suggested frontend deployment steps:

1. Create a new frontend deployment project.
2. Connect the frontend codebase.
3. Set the root directory to `frontend/` if needed.
4. Add the frontend environment variable:

```env
VITE_API_BASE_URL=<your-deployed-backend-api-url>
```

5. Build and deploy the project.

### Deployment Variables Used

Frontend:

- `VITE_API_BASE_URL`

Backend:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET_KEY`
- `CONTACT_RECEIVER_EMAIL`

### Live URLs

Fill these before final submission:

- Deployed frontend URL: `TBD`
- Deployed backend API URL: `TBD`

### Deployment Evidence

Add screenshots or proof of successful deployment here before submission:

- frontend deployment screenshot: `TBD`
- backend deployment screenshot: `TBD`

## Testing

### Unit & Integration Testing

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Install the required testing packages:

```bash
npm install -D jest @jest/globals supertest mongodb-memory-server cross-env
```

Run all unit and integration tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run test:unit
```

Run only integration tests:

```bash
npm run test:integration
```

### Performance Testing

Performance tests use Artillery.io. Install it globally:

```bash
npm install -g artillery
```

Start the backend server in one terminal:

```bash
cd backend
npm run dev
```

In a second terminal, run the performance tests:

```bash
artillery run backend/tests/performance/restroom.yml
artillery run backend/tests/performance/user.yml
```

## Git Workflow

The assignment requires proper git workflow and regular commits. This repository should maintain:

- meaningful commit messages
- regular progress commits
- clear commit history
- proper GitHub submission

## Current Project Scope

Based on the current codebase, this project includes:

- authentication and account management
- user and staff profile functionality
- admin management screens
- restroom-related features
- issue / complaint reporting
- location-based form support

This repository may still include work-in-progress sections that should be finalized before final evaluation.

## Submission Checklist

- source code pushed to GitHub
- setup instructions included
- API documentation included
- deployment section included
- testing instruction report included
- environment variables documented without exposing secrets
- live deployment links added
- screenshots / deployment evidence added

## Team Details

Update before submission:

- Module: `SE3040 - Application Frameworks`
- Assignment: `Full Stack Application Development`
- Year: `Year 03`
- Group members: `TBD`
- Student IDs: `TBD`

## Notes

- The frontend and backend are maintained as separate applications inside the same repository.
- Some features depend on external services such as MongoDB, email delivery, and Cloudinary.
- A valid backend API and environment configuration are required for most protected features.
