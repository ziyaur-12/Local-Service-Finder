# Smart Local Services Finder

A full-stack web application that helps users find and book local service providers such as electricians, plumbers, tutors, mechanics, and more.

## Features

### For Users (Customers)
- Search services by category, location, and keywords
- View service details and provider profiles
- Book services with preferred date and time
- Track booking status
- Leave reviews and ratings after service completion

### For Service Providers
- Create and manage service listings
- Set pricing, availability, and service area
- Accept or reject booking requests
- View customer details and booking history
- Respond to customer reviews

### For Admins
- Dashboard with platform statistics
- Manage users (activate/deactivate/delete)
- Manage services (approve/deactivate)
- Monitor all bookings

## Tech Stack

### Frontend
- React.js 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router DOM (Routing)
- Axios (API calls)
- Google Maps API (Location features)
- Lucide React (Icons)
- React Hot Toast (Notifications)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (Authentication)
- Bcrypt.js (Password hashing)
- Cloudinary (Image uploads)
- Express Validator (Input validation)

## Project Structure

```
smart-local-services-finder/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── bookingController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LocationPicker.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── ServiceDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── ProviderDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AddService.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Cloud account (for Maps API)
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update profile
- `PUT /api/auth/updatepassword` - Update password

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get single service
- `GET /api/services/category/:category` - Get services by category
- `POST /api/services` - Create service (Provider only)
- `PUT /api/services/:id` - Update service (Provider only)
- `DELETE /api/services/:id` - Delete service (Provider only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/provider` - Get provider's bookings
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `GET /api/reviews/my` - Get user's reviews

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/services` - Get all services

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables from `.env`

### Frontend (Vercel)
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set root directory to `frontend`
4. Add environment variables from `.env`

## Service Categories

- Electrician
- Plumber
- Carpenter
- Mechanic
- Tutor
- Painter
- Cleaner
- Gardener
- AC Repair
- Appliance Repair
- Pest Control
- Moving & Packing
- Beauty & Salon
- Fitness Trainer
- Photographer
- Event Planner

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Final Year Project - Smart Local Services Finder
