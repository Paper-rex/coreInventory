# CoreInventory

A complete full-stack inventory management system constructed using contemporary web technologies. This program offers total control over stock movements, warehouse operations, product inventory, and reporting.

## Features

### User Management
- Role-based access control (Admin, Manager, Staff, Viewer)
- Secure authentication with JWT tokens
- Password reset functionality with OTP
- Email notifications

### Product Management
- Product catalog with categories
- SKU tracking and unit of measure
- Reorder level management
- Stock level monitoring

### Warehouse Operations
- Multi-warehouse support
- Location-based stock tracking
- Internal transfers between locations
- Stock adjustments with audit trail

### Inventory Transactions
- **Receipts**: Goods receipt from suppliers
- **Deliveries**: Customer order fulfillment
- **Internal Transfers**: Stock movement between locations
- **Stock Adjustments**: Inventory corrections with reason tracking

### Reporting & Analytics
- Stock ledger with complete transaction history
- Dashboard with key metrics and charts
- Real-time stock levels across all locations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with PostgreSQL database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **CORS** for cross-origin requests

### Frontend
- **React 18** with Vite build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Paper-rex/coreInventory.git
   cd coreInventory
   ```

2. **Backend Setup**
   ```bash
   cd CoreInventory/backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/coreinventory"
   JWT_SECRET="your-jwt-secret-key"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-email-password"
   PORT=5000
   ```

3. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

## Usage

1. **Start the Backend Server**
   ```bash
   cd CoreInventory/backend
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the Frontend**
   ```bash
   cd CoreInventory/frontend
   npm run dev
   ```
   Application will be available at http://localhost:5173

3. **Build for Production**
   ```bash
   # Backend
   npm run start

   # Frontend
   npm run build
   npm run preview
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Warehouses & Locations
- `GET /api/warehouses` - Get all warehouses
- `POST /api/warehouses` - Create new warehouse
- `GET /api/locations` - Get all locations

### Inventory Operations
- `GET /api/receipts` - Get receipts
- `POST /api/receipts` - Create receipt
- `GET /api/deliveries` - Get delivery orders
- `POST /api/deliveries` - Create delivery order
- `GET /api/transfers` - Get internal transfers
- `POST /api/transfers` - Create internal transfer
- `GET /api/adjustments` - Get stock adjustments
- `POST /api/adjustments` - Create stock adjustment

### Reporting
- `GET /api/dashboard` - Dashboard data
- `GET /api/ledger` - Stock ledger entries

## Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: System users with role-based permissions
- **Categories**: Product categorization
- **Products**: Inventory items with SKU and reorder levels
- **Warehouses**: Storage facilities
- **Locations**: Specific storage areas within warehouses
- **Stock**: Current inventory levels by product and location
- **Receipts**: Incoming goods transactions
- **DeliveryOrders**: Outgoing goods transactions
- **InternalTransfers**: Stock movements between locations
- **StockAdjustments**: Inventory corrections
- **StockLedger**: Complete transaction history

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository.
