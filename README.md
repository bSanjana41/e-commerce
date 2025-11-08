# E-Commerce API

A RESTful API built with Node.js, Express, and MongoDB for an e-commerce platform. This project handles user authentication, product management, shopping cart, order processing, and payment workflows. I've implemented features like JWT authentication, database transactions, stock reservation system, and background job processing.

## Features

- **User Authentication**: JWT-based auth with role-based access (User/Admin roles)
- **Order Management**: Orders go through different statuses - PENDING_PAYMENT → PAID → SHIPPED → DELIVERED → CANCELLED
- **Stock Reservation**: When user checks out, stock is reserved to prevent overselling (uses transactions)
- **Database Transactions**: Used for checkout and payment to ensure data consistency
- **Pagination & Filtering**: Products and orders support pagination, sorting, and filtering
- **Email Queue**: Background job queue for sending confirmation emails (currently just logs to console)
- **Order Timeout**: Unpaid orders get cancelled automatically after 15 minutes

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Joi (for request validation)
- JWT (jsonwebtoken) for authentication
- bcrypt for password hashing

## Project Structure

- **config/** - Configuration files
  - `db.js` - Database connection setup
  - `envConfig.js` - Environment variables loader

- **controller/** - Request handlers
  - `admin.controller.js` - Admin operations
  - `auth.controller.js` - Authentication (register/login)
  - `cart.controller.js` - Cart management
  - `order.controller.js` - Order processing
  - `product.controller.js` - Product CRUD operations

- **middleware/** - Express middleware
  - `auth.js` - JWT authentication & authorization
  - `errorHandler.js` - Centralized error handling
  - `validator.js` - Request validation middleware

- **model/** - Mongoose schemas
  - `cart.schema.js`
  - `order.Schema.js`
  - `payment.schema.js`
  - `product.schema.js`
  - `user.schema.js`

- **route/** - API routes
  - `admin.route.js`
  - `auth.route.js`
  - `cart.route.js`
  - `order.route.js`
  - `product.route.js`

- **services/** - Background services
  - `jobQueue.js` - Async job queue for emails
  - `orderTimeout.js` - Auto-cancel unpaid orders

- **utils/** - Helper functions
  - `jwt.js` - JWT token generation/verification
  - `password.js` - Password hashing utilities

- **validations/** - Joi validation schemas
  - `auth.validation.js`
  - `cart.validation.js`
  - `order.validation.js`
  - `product.validation.js`

- `index.js` - Main application file
- `server.js` - Server startup

## Installation & Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd E-Commerce/Backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   
   Create a `.env` file in the `Backend` directory with these variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/ecommerce
   PORT=5500
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```
   
   **Note**: Make sure to change the JWT_SECRET to something secure in production!

4. Start MongoDB
   
   You need MongoDB running. You can either:
   - Install MongoDB locally and start it
   - Use MongoDB Atlas (free cloud option) - just update the MONGO_URI in .env

5. Run the application
   ```bash
   # Development (auto-reload with nodemon)
   npm run dev
   
   # Production
   npm start
   ```
   
   Server should start on `http://localhost:5500`

## API Endpoints

### Authentication

**POST** `/api/auth/register` - Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"  // optional, defaults to "USER"
}
```

**POST** `/api/auth/login` - Login and get JWT token
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Products

**GET** `/api/products` - Get all products (public endpoint, no auth needed)
- Query params: `page`, `limit`, `sortBy` (name|price|createdAt), `sortOrder` (asc|desc), `name` (search filter)

**POST** `/api/products` - Create new product (Admin only)
```json
{
  "name": "Laptop",
  "price": 999.99,
  "description": "High-performance laptop",
  "availableStock": 50
}
```

**PUT** `/api/products/:id` - Update product (Admin only)

**DELETE** `/api/products/:id` - Delete product (Admin only)

### Cart

**GET** `/api/cart` - Get current user's cart (requires auth)

**POST** `/api/cart/items` - Add item to cart
```json
{
  "productId": "product_id_here",
  "quantity": 2
}
```

**DELETE** `/api/cart/items/:productId` - Remove item from cart

### Orders

**POST** `/api/orders/checkout` - Create order from cart
- Reserves stock and creates order with PENDING_PAYMENT status
- Uses database transaction so if anything fails, everything rolls back

**POST** `/api/orders/:id/pay` - Process payment for an order
- Updates order to PAID status
- Finalizes stock (removes from reserved)
- Queues email confirmation

**GET** `/api/orders` - Get user's order history
- Query params: `page`, `limit`

**GET** `/api/orders/:id` - Get specific order details

### Admin Routes

**GET** `/api/admin/orders` - Get all orders (Admin only)
- Query params: `page`, `limit`, `status` (to filter by status)

**PATCH** `/api/admin/orders/:id/status` - Update order status
```json
{
  "status": "SHIPPED"  // or "DELIVERED" or "CANCELLED"
}
```

## Authentication

For protected endpoints, you need to include the JWT token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

You get the token when you register or login. Just copy it and use it in subsequent requests.

## How It Works - Order Flow

Here's the typical flow when a user places an order:

1. User adds products to cart → Cart gets updated
2. User clicks checkout → Order is created with status `PENDING_PAYMENT`
   - Stock gets reserved (moved from availableStock to reservedStock)
   - This happens in a transaction, so if something fails, nothing gets saved
3. User pays → Order status changes to `PAID`
   - Reserved stock is released (it's now permanently sold)
   - Available stock is reduced
   - Email confirmation gets queued (currently just logs to console)
4. Admin can update status → Can mark order as `SHIPPED` or `DELIVERED`
5. Timeout check → If order isn't paid within 15 minutes, it gets cancelled automatically
   - Reserved stock goes back to available stock

## Database Models

### User
- name, email, password (hashed with bcrypt), role (USER or ADMIN)

### Product
- name, price, description, availableStock, reservedStock

### Cart
- userId, items array with productId and quantity

### Order
- userId, items (with productId, quantity, priceAtPurchase), totalAmount, status, createdAt, updatedAt

### Payment
- orderId, transactionId, amount, status (SUCCESS or FAILED)

## Error Handling

All errors are handled by a centralized middleware. Error responses look like this:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common errors:
- 400: Bad request (validation errors, invalid data)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (wrong role, e.g., user trying to access admin route)
- 404: Not found
- 409: Conflict (e.g., email already exists)
- 500: Server error

## Testing with Postman

I've included a Postman collection file (`E-Commerce-API.postman_collection.json`) that has all the endpoints set up with hardcoded URLs (`http://localhost:5500/api`).

To use it:
1. Open Postman
2. Click "Import" button
3. Select the `E-Commerce-API.postman_collection.json` file
4. All URLs are pre-configured - no setup needed!

**Collection Variables (automatically managed):**
- `user_token`: Automatically saved when you login as a user (used in Authorization headers)
- `admin_token`: Automatically saved when you login as admin (used in Authorization headers)
- `order_id`: Automatically saved when you create an order via checkout (used in payment endpoint)

**How it works:**
- The collection has test scripts that automatically capture tokens and order IDs from responses
- After login, tokens are saved automatically - you don't need to copy-paste them
- After checkout, the order ID is saved automatically for the payment endpoint
- Just run the requests in order: Register/Login → Add to Cart → Checkout → Process Payment

## Implementation Notes

### Transactions

I used MongoDB sessions for checkout and payment to make sure everything happens atomically:
- **Checkout**: If any product doesn't have enough stock, the whole operation rolls back (nothing gets saved)
- **Payment**: Stock finalization and order update happen together - either both succeed or both fail

This prevents issues like reserving stock for one product but failing on another, which would leave data in an inconsistent state.

### Stock Reservation

The stock system works like this:
- Products have two fields: `availableStock` and `reservedStock`
- When user checks out: `availableStock` goes down, `reservedStock` goes up
- When payment succeeds: `reservedStock` goes down (stock is now sold)
- If order gets cancelled: `reservedStock` goes down, `availableStock` goes back up

This prevents overselling - once stock is reserved, other users can't buy it until the order is paid or cancelled.

### Order Timeout

There's a background service that runs every minute checking for unpaid orders older than 15 minutes. If found, it cancels them and releases the reserved stock back. This prevents stock from being stuck in "reserved" state forever.

### Job Queue

I implemented a simple in-memory job queue for async tasks like sending emails. Right now it just logs to console, but in a real app you'd want to use something like Bull or RabbitMQ for production. The current implementation is fine for this project though.

## Environment Variables

You need these in your `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (default 5500) | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes |
| `NODE_ENV` | Set to "development" or "production" | No |

---

**Author**: Sanjana Bandyopadhyay

