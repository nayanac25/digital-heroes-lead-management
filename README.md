# LeadFlow - Lead Management System

LeadFlow is a full-stack lead management application developed as part of the **Digital Heroes Full Stack Development Training Task**.

The application allows a sales team to capture leads, manage the lead lifecycle, assign leads to team members, update lead statuses, maintain notes and activity history, and enforce role-based permissions for administrators and members.

## Features

### Public Lead Capture
- Public enquiry form
- No authentication required
- Captures name, email, phone, and company information

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Admin and Member roles
- Protected frontend routes
- Protected backend API endpoints

### Admin Features
- View all leads
- Create leads
- Edit lead information
- Delete leads
- Assign leads to members
- Update lead status
- Add notes
- View activity history
- Search leads
- Filter leads by status
- Filter leads by assigned member
- Paginated lead listing

### Member Features
- View only assigned leads
- View lead details
- Update lead status
- Add notes
- View activity history

### Lead Lifecycle

Supported lead statuses:

- New
- Contacted
- Qualified
- Won
- Lost

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- CORS
- dotenv

### Testing
- Jest
- Supertest

## Project Structure

```text
Digital-Heroes-Task/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Roles and Permissions

| Feature | Admin | Member |
|---|:---:|:---:|
| View leads | All leads | Assigned leads only |
| View lead details | Yes | Assigned leads |
| Create lead | Yes | No |
| Edit lead | Yes | No |
| Delete lead | Yes | No |
| Assign lead | Yes | No |
| Update status | Yes | Yes |
| Add notes | Yes | Yes |
| View activity history | Yes | Yes |
| View members | Yes | No |

Backend authorization is enforced in addition to frontend protected routes.

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Digital-Heroes-Task
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the development server:

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will run on the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

## API Documentation

Base API URL during local development:

```text
http://localhost:5000/api
```

Protected endpoints require a JWT:

```text
Authorization: Bearer <token>
```

### Authentication

#### Register User

```http
POST /api/auth/register
```

Creates a user account.

#### Login

```http
POST /api/auth/login
```

Authenticates a user and returns a JWT token along with user information.

#### Get Members

```http
GET /api/auth/members
```

Access: **Admin only**

Returns users with the Member role for lead assignment.

### Public Lead API

#### Submit Public Lead

```http
POST /api/public/leads
```

Access: **Public**

No JWT authentication is required.

Example request body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "company": "ABC Technologies"
}
```

### Lead APIs

#### Create Lead

```http
POST /api/leads
```

Access: **Admin only**

#### Get Leads

```http
GET /api/leads
```

Access: **Admin and Member**

Admins can retrieve all permitted leads. Members receive only leads assigned to their account.

Supported query parameters:

| Parameter | Description |
|---|---|
| `page` | Page number |
| `limit` | Number of records per page |
| `status` | Filter by lead status |
| `assignedTo` | Filter by assigned member (Admin) |
| `search` | Search by name, email, company, or phone |

Example:

```http
GET /api/leads?page=1&limit=5&status=qualified&search=rahul
```

Example response structure:

```json
{
  "page": 1,
  "limit": 5,
  "totalLeads": 1,
  "totalPages": 1,
  "leads": []
}
```

#### Get Lead by ID

```http
GET /api/leads/:id
```

Access: **Admin and authorized Member**

#### Assign Lead

```http
PATCH /api/leads/:id/assign
```

Access: **Admin only**

Example body:

```json
{
  "userId": "member_user_id"
}
```

#### Update Lead Status

```http
PATCH /api/leads/:id/status
```

Access: **Admin and Member**

Example body:

```json
{
  "status": "qualified"
}
```

Supported statuses:

```text
new
contacted
qualified
won
lost
```

#### Add Lead Note

```http
POST /api/leads/:id/notes
```

Access: **Admin and Member**

Example body:

```json
{
  "text": "Customer is interested. Follow up tomorrow."
}
```

#### Update Lead

```http
PATCH /api/leads/:id
```

Access: **Admin only**

#### Delete Lead

```http
DELETE /api/leads/:id
```

Access: **Admin only**

## Pagination and Filtering

The Lead API supports server-side pagination and filtering.

Example:

```http
GET /api/leads?page=2&limit=5&status=contacted
```

Search can be combined with filters:

```http
GET /api/leads?page=1&limit=5&status=qualified&search=technology
```

Admin users can additionally filter by assigned member:

```http
GET /api/leads?assignedTo=<member-id>
```

## Activity History

Lead actions are recorded to provide a history of changes.

Activity history can include actions such as:

- Lead created
- Lead assigned to a member
- Status updated
- Note added
- Lead information updated

The lead details interface displays the activity timeline along with available timestamps and user information.

## Automated Tests

Backend automated tests are implemented using **Jest** and **Supertest**.

Run tests from the server directory:

```bash
cd server
npm test
```

The test suite covers important application behavior including authentication, authorization, and lead-management rules.

## Security

The application implements:

- JWT authentication
- Password hashing
- Backend role-based authorization
- Protected frontend routes
- Environment variables for secrets
- Role-based lead access
- Restricted administrative operations

Sensitive values such as the MongoDB connection URI and JWT secret are stored in `.env` and excluded from Git.

An `.env.example` file is provided to document required environment variables without exposing secrets.

## Deployment

### Frontend

Deployment URL:

```text
To be added after deployment
```

### Backend API

Deployment URL:

```text
To be added after deployment
```

Deployment URLs will be added after production deployment and verification.

## Demo Credentials

Demo Admin and Member credentials will be provided for evaluation after deployment.

```text
Admin
Email: To be added
Password: To be added

Member
Email: To be added
Password: To be added
```

These accounts are intended only for project evaluation.

## Digital Heroes Training Task

This project was created for the **Digital Heroes Full Stack Development Training Task**.

The live application includes the required visible credit:

**Built for Digital Heroes Training Task**

Digital Heroes: `digitalheroesco.com`

## Author

Nayana Chafekar

Full Stack / MERN Stack Developer