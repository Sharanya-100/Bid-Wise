# Online Auction Platform

A modern, real-time auction platform built with React and Express.js. This application enables users to list products for auction, place bids, and engage in a competitive bidding experience with real-time updates.

## Features

- **User Authentication**: Secure signup, login, and profile management
- **Product Listings**: Create, manage, and browse product listings with rich details and images
- **Real-time Bidding**: Place bids and receive instant updates using Socket.IO
- **Auction Timer**: Countdown timers with automatic auction extensions on last-minute bids
- **Responsive Design**: Mobile-friendly interface built with Material-UI
- **Search & Filtering**: Find auctions by categories, price range, and other attributes
- **Admin Dashboard**: Manage users, auctions, and platform activity
- **Secure Payments**: Integration with payment gateways (placeholder for future implementation)
- **Notifications**: Real-time alerts for bid updates, auction endings, and more

## Tech Stack

### Frontend
- React.js
- Material-UI
- Redux Toolkit (State Management)
- React Router (Routing)
- Socket.IO Client (Real-time communication)
- Axios (API requests)
- React Query (Data fetching)
- Formik & Yup (Form handling and validation)

### Backend
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Socket.IO
- Bcrypt (Password hashing)
- Multer (File uploads)

## Project Structure

```
auction-platform/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       ├── store/          # Redux store setup
│       ├── hooks/          # Custom React hooks
│       ├── utils/          # Utility functions
│       └── assets/         # Images, fonts, etc.
│
└── server/                 # Express backend
    ├── controllers/        # Route controllers
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── middleware/         # Custom middleware
    ├── config/             # Configuration files
    └── uploads/            # Uploaded files
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation and Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd auction-platform
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies
   ```bash
   cd ../client
   npm install
   ```

4. Set up environment variables
   - Create `.env` file in the server directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     CLIENT_URL=http://localhost:3000
     ```

### Running the Application

1. Start the server (development mode)
   ```bash
   cd server
   npm run dev
   ```

2. Start the client (in a new terminal)
   ```bash
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Products
- `POST /api/products` - Create a new product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Auctions
- `POST /api/auctions` - Create a new auction
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get a single auction
- `PUT /api/auctions/:id` - Update an auction
- `DELETE /api/auctions/:id` - Delete an auction

### Bids
- `POST /api/auctions/:id/bids` - Place a bid on an auction
- `GET /api/auctions/:id/bids` - Get all bids for an auction

## Future Enhancements

- Payment gateway integration
- Email notifications
- User ratings and reviews
- Social media sharing
- Advanced search and filtering
- Mobile app development

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Material-UI for the component library
- Socket.IO for real-time functionality
- MongoDB Atlas for database hosting

## MongoDB Setup

This application uses MongoDB as its database. Follow these steps to set up and connect to MongoDB:

### Option 1: Local MongoDB Setup

1. Install MongoDB locally from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The application is configured to connect to `mongodb://localhost:27017/auction-platform` by default

### Option 2: MongoDB Atlas Setup (Cloud-hosted)

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access with a username and password
4. Set up network access (allow access from anywhere for development)
5. Get your connection string from Atlas (click "Connect" on your cluster)
6. Update the `MONGO_URI` in the `.env` file with your MongoDB Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/auction-platform?retryWrites=true&w=majority
   ``` 