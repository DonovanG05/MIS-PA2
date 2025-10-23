# Freelance Music Platform

A comprehensive web platform connecting music teachers and students for online and in-person music lessons. The platform features a complete booking system, payment processing, and administrative dashboard with detailed analytics and reporting.

## 🚀 Quick Start

### Prerequisites

**Node.js Installation Required**
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Choose the LTS (Long Term Support) version for stability
- Verify installation by running `node --version` in your terminal
- npm (Node Package Manager) is included with Node.js

### Installation & Setup

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/yourusername/freelance-music.git
   cd freelance-music
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   node server.js
   ```

4. **Access the Application**
   - **Homepage**: http://localhost:3000
   - **Admin Portal**: http://localhost:3000/admin-portal
   - **Teacher Portal**: http://localhost:3000/teacher-portal
   - **Student Portal**: http://localhost:3000/student-portal

**Note**: Test accounts are created automatically when you first start the server. See the Test Accounts section below for login credentials.

## 🧪 Test Accounts

For quick testing and demonstration, you can use these pre-configured accounts. However, we **encourage you to create your own accounts** to get the full personalized experience of the platform:

### **Student Account**
- **Email**: student@test.com
- **Password**: password123
- **Features**: Can book lessons, upload sheet music, view lesson history

### **Teacher Account**
- **Email**: teacher@test.com
- **Password**: password123
- **Features**: Can create availability, manage lessons, view earnings

### **Admin Account**
- **Email**: admin@test.com
- **Password**: password123
- **Features**: Full administrative access to all platform features

**Note**: These accounts are created automatically when you first start the server. If you need to reset them, delete the `freelance_music.db` file and restart the server.

### **Why Create Your Own Account?**
- **Personalized Experience**: Set up your own profile, preferences, and learning goals
- **Real Data**: See how the platform works with your actual information
- **Full Feature Access**: Experience the complete registration and onboarding process
- **Custom Settings**: Configure your own rates, availability, and teaching preferences
- **Authentic Testing**: Test the platform as a real user would experience it

## 🎯 Features Overview

### 👨‍🎓 Student Features

#### **Account Management**
- **Registration**: Create student accounts with detailed profiles
- **Profile Setup**: Specify primary instrument, skill level, learning goals, and location
- **Referral Tracking**: Select how you heard about Freelance Music (online advertisement, word of mouth, other)

#### **Lesson Discovery & Booking**
- **Browse Available Lessons**: View all available lesson slots with teacher information
- **Advanced Filtering**: Filter by instrument, lesson type (virtual/in-person), and date
- **Teacher Information**: See teacher rates, available instruments, and lesson types
- **Multi-Instrument Support**: Teachers can offer multiple instruments per time slot
- **Real-Time Availability**: Live calendar showing available booking slots

#### **Booking System**
- **Secure Booking**: Credit card required before booking lessons
- **Payment Validation**: Luhn algorithm validation for credit card numbers
- **Double-Booking Prevention**: System prevents multiple students from booking the same slot
- **Instrument Selection**: Choose specific instruments from teacher's available options
- **Booking Confirmation**: Immediate confirmation with lesson details

#### **Lesson Management**
- **My Lessons Dashboard**: View all upcoming and completed lessons
- **Lesson History**: Complete transaction history with payment details
- **Payment Tracking**: See total spent and individual lesson costs
- **Status Updates**: Real-time lesson status (upcoming, completed, cancelled)
- **Sheet Music Upload**: Upload PDF, JPG, or PNG files when booking lessons for teacher review

#### **Recurring Lessons**
- **Browse Recurring Slots**: View all available recurring lesson time slots from teachers
- **Frequency Selection**: Choose how often you want lessons (weekly, bi-weekly, monthly)
- **Start Date Control**: Specify when you want to begin your recurring lessons
- **My Recurring Lessons**: Manage all your active recurring lesson subscriptions
- **Flexible Management**: Pause, resume, or cancel recurring lessons at any time
- **Automatic Billing**: Payment automatically processed when teacher confirms each lesson

#### **Payment System**
- **Credit Card Management**: Add and manage payment methods
- **Secure Processing**: Validated credit card storage and processing
- **Transaction History**: Detailed payment records with dates and amounts
- **Automatic Charging**: Cards charged automatically upon lesson completion

### 👨‍🏫 Teacher Features

#### **Profile Management**
- **Comprehensive Profiles**: Detailed teacher profiles with bio, experience, and specialties
- **Multi-Instrument Teaching**: Support for teaching multiple instruments
- **Rate Management**: Set and update hourly rates for different lesson types
- **Profile Photos**: Upload and manage profile images

#### **Availability Management**
- **Flexible Scheduling**: Set availability for specific dates and times
- **Multi-Instrument Slots**: Offer multiple instruments during the same time slot
- **Lesson Type Options**: Support for both virtual and in-person lessons
- **Duration Control**: Set lesson durations (typically 60 minutes)
- **Real-Time Updates**: Availability updates immediately visible to students

#### **Lesson Management**
- **Booked Lessons View**: See all upcoming and completed lessons
- **Student Information**: Access student details and lesson notes
- **Lesson Completion**: Mark lessons as completed to trigger payment processing
- **Lesson History**: Track all past lessons and earnings
- **Sheet Music Access**: View and download student-uploaded sheet music files for each lesson

#### **Recurring Lessons**
- **Create Recurring Slots**: Set up "always available" time slots for recurring lessons
- **Time Commitment**: Commit to being available at specific times every week
- **Student Booking Management**: View and manage students who book your recurring slots
- **Lesson Confirmation**: Confirm when recurring lessons occur to process payments
- **Flexible Management**: Pause or delete recurring slots as needed
- **Revenue Tracking**: Monitor earnings from recurring lesson subscriptions

#### **Financial Management**
- **Earnings Tracking**: View net earnings after platform fees (90% of lesson cost)
- **Payment History**: Detailed records of all completed lessons and payments
- **Bank Information**: Secure bank account setup for receiving payments
- **Revenue Analytics**: Track earnings over time and by instrument

#### **Bank Account Setup**
- **Secure Banking**: Routing and account number validation
- **Checksum Validation**: Bank routing number validation for accuracy
- **Account Management**: Update banking information as needed
- **Payment Processing**: Automatic payment to teacher accounts upon lesson completion

### 👨‍💼 Admin Features

#### **Dashboard Overview**
- **User Statistics**: Total users, teachers, students, and lesson counts
- **Revenue Analytics**: Platform revenue tracking and financial overview
- **Recurring Lessons**: Monitor active recurring lesson subscriptions
- **System Health**: Monitor active users and system performance

#### **Financial Management**
- **Revenue Tracking**: Monitor 10% platform fees from all completed lessons
- **Payment Processing**: Oversee all financial transactions
- **Revenue Reports**: Detailed breakdown of platform earnings
- **Transaction Management**: View and manage all payment records

#### **Advanced Analytics & Reporting**

##### **Revenue Analysis**
- **Platform Revenue**: Total earnings from 10% platform fees (includes both regular and recurring lessons)
- **Revenue by Quarter**: Quarterly breakdown of platform earnings
- **Revenue by Instrument**: Pie chart showing earnings by instrument type (includes recurring lessons)
- **Revenue by Student**: Individual student contribution to platform revenue (includes recurring subscriptions)

##### **Student Analytics**
- **Referral Sources**: Bar chart showing how students discovered the platform
- **Student Spending**: Track individual student spending patterns
- **Lesson Distribution**: Analyze lesson distribution across instruments and teachers
- **Repeat Lessons Report**: Bar chart showing students with multiple lessons and their loyalty levels

##### **Teacher Analytics**
- **Teacher Performance**: Track teacher earnings and lesson completion rates
- **Popular Instruments**: Identify most requested instruments
- **Teacher Utilization**: Monitor teacher availability and booking rates

#### **Calendar Management**
- **Interactive Calendar**: Visual calendar showing all scheduled lessons
- **Lesson Details**: Click on calendar dates to see detailed lesson information
- **Booking Overview**: Comprehensive view of all system bookings
- **Date Navigation**: Easy navigation through different months and years

#### **Data Management**
- **User Management**: Monitor and manage all user accounts
- **Lesson Oversight**: View and manage all lesson bookings
- **System Monitoring**: Track platform usage and performance
- **Data Export**: Export booking and financial data for analysis

#### **Reporting Features**
- **Custom Reports**: Generate detailed reports on various metrics
- **Data Visualization**: Interactive charts and graphs for data analysis
- **Export Capabilities**: Export data for external analysis
- **Real-Time Updates**: Live data updates across all admin features

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.3
- **Backend**: Node.js, Express.js
- **Database**: SQLite (file-based, no server required)
- **Charts**: Chart.js for interactive data visualization
- **Validation**: Luhn algorithm for credit card validation, checksum validation for bank routing numbers
- **Payment Processing**: Simulated payment system with automatic fee calculation

## 💰 Business Model

- **Platform Fee**: 10% of each lesson cost goes to Freelance Music
- **Teacher Earnings**: 90% of lesson cost goes to the teacher
- **Payment Processing**: Automatic payment distribution upon lesson completion
- **Revenue Tracking**: Comprehensive analytics for platform revenue monitoring

## 🗄️ Database Setup

The application uses SQLite, which creates a local database file (`freelance_music.db`) automatically when you first start the server. The database includes:

- **Schema**: Defined in `data/init.sql`
- **Sample Data**: Populated from `data/sample_data.sql` (commented out for clean start)
- **Operations**: Handled by `scripts/database.js`

### Database Structure

- **users**: Base table for all user types (students, teachers, admins)
- **teachers**: Extended profile information for music teachers with multi-instrument support
- **students**: Extended profile information for students with referral source tracking
- **lessons**: Booked lesson records with payment integration
- **availability**: Teacher schedule availability with multi-instrument support
- **payments**: Complete payment records with platform fee tracking
- **payment_methods**: Student credit card information (encrypted)
- **bank_accounts**: Teacher banking information for payments

### Key Database Features

- **Foreign Key Constraints**: Ensures data integrity across all relationships
- **JSON Storage**: Multi-instrument data stored as JSON arrays
- **Transaction Support**: Atomic operations for booking and payment processing
- **Validation**: Built-in data validation and constraints
- **Indexing**: Optimized queries for performance

## 🔌 API Endpoints

### User Management
- `POST /api/signup/teacher` - Create new teacher account with multi-instrument support
- `POST /api/signup/student` - Create new student account with referral tracking
- `GET /api/admin/stats` - Get comprehensive admin statistics

### Lesson Management
- `GET /api/lessons/available` - Get available lessons with filtering
- `POST /api/lessons/book` - Book a lesson with payment validation
- `GET /api/student/:id/lessons` - Get student's lesson history
- `GET /api/teacher/:id/lessons` - Get teacher's lesson schedule
- `POST /api/lessons/complete` - Mark lesson as completed and process payment

### Availability Management
- `POST /api/availability` - Add teacher availability with multi-instrument support
- `GET /api/teacher/:teacherId/availability` - Get teacher's availability schedule
- `DELETE /api/availability/:id` - Remove availability slot

### Payment Processing
- `POST /api/payment-methods` - Add student credit card
- `GET /api/payment-methods/:userId` - Get student payment methods
- `POST /api/bank-accounts` - Add teacher bank account
- `GET /api/student/:studentId/payments` - Get student payment history
- `GET /api/teacher/:teacherId/payments` - Get teacher earnings history

### Admin & Analytics
- `GET /api/admin/dashboard` - Get comprehensive dashboard data
- `GET /api/admin/payments` - Get all payment records and revenue
- `GET /api/admin/referral-report` - Get student referral analytics
- `GET /api/admin/bookings` - Get all lesson bookings

### Profile Management
- `PUT /api/teacher/:id/profile` - Update teacher profile and pricing
- `PUT /api/student/:id/profile` - Update student profile

## 📁 File Structure

```
freelance-music/
├── data/
│   ├── init.sql              # Complete database schema with all tables
│   └── sample_data.sql       # Sample data (commented out for clean start)
├── scripts/
│   ├── database.js           # Complete database operations and queries
│   ├── main.js              # Homepage functionality and form validation
│   ├── admin-portal.js      # Admin dashboard with analytics and reporting
│   ├── teacher-portal.js    # Teacher portal with availability and earnings
│   └── student-portal.js    # Student portal with booking and payment
├── styles/
│   └── main.css             # Custom CSS with responsive design
├── homepage.html            # Landing page with signup forms
├── admin-portal.html        # Admin interface with comprehensive dashboard
├── teacher-portal.html      # Teacher interface with availability management
├── student-portal.html      # Student interface with lesson booking
├── server.js                # Express server with all API endpoints
├── package.json             # Dependencies and scripts
└── README.md               # This comprehensive documentation
```

## 🎨 Key Features Implemented

### **Multi-Instrument Support**
- Teachers can offer multiple instruments during the same time slot
- Students can select specific instruments when booking
- Database stores instruments as JSON arrays for flexibility

### **Advanced Payment System**
- Credit card validation using Luhn algorithm
- Bank routing number validation with checksum
- Automatic payment processing with 10% platform fee
- Complete transaction history and tracking

### **Comprehensive Analytics**
- Revenue by instrument with platform fee tracking
- Revenue by student with spending analysis
- Quarterly revenue breakdown
- Student referral source tracking
- Teacher earnings and performance metrics

### **Interactive Calendar System**
- Visual calendar with lesson highlighting
- Clickable dates showing lesson details
- Real-time availability updates
- Hover effects and visual indicators

### **File Upload System**
- Sheet music upload for students (PDF, JPG, PNG)
- Secure file storage with unique naming
- Teacher access to uploaded files
- File type and size validation (10MB limit)

### **Advanced Reporting**
- Repeat lessons analysis showing student loyalty
- Revenue tracking with platform fee calculations
- Student referral source analytics
- Interactive charts and data visualization

### **Data Validation & Security**
- Form validation for all user inputs
- Credit card number validation
- Bank account validation
- Double-booking prevention
- Atomic database transactions

## 🧪 Testing & Validation

### **Test Credit Card Numbers**
For testing payment functionality, use these valid test numbers:
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

### **Test Bank Information**
For testing teacher bank account setup:
- **Routing Number**: 021000021 (Chase Bank)
- **Account Number**: 1234567890

### **Testing Workflow**
1. **Create Accounts**: Register as teacher and student
2. **Set Availability**: Teacher adds available time slots
3. **Book Lessons**: Student books lessons with credit card
4. **Complete Lessons**: Teacher marks lessons as completed
5. **Verify Payments**: Check payment processing and fee distribution
6. **Test Recurring Lessons**: Create recurring slots as a teacher and book them as a student

## 🔧 Development

### Adding New Features

1. **Database Changes**: Update `data/init.sql` for schema changes
2. **API Endpoints**: Add new routes in `server.js`
3. **Frontend**: Update HTML files and corresponding JavaScript files
4. **Styling**: Add custom CSS in `styles/main.css`
5. **Validation**: Add appropriate validation in database and frontend

### Database Operations

The `Database` class in `scripts/database.js` provides comprehensive methods for:
- **User Management**: Create, read, update user accounts
- **Lesson Management**: Booking, completion, and history tracking
- **Availability Management**: Teacher scheduling and slot management
- **Payment Processing**: Credit card and bank account handling
- **Analytics**: Revenue tracking and reporting
- **Admin Functions**: Dashboard data and system monitoring

### Key Development Patterns

- **Atomic Transactions**: All booking and payment operations use database transactions
- **Validation Layers**: Multiple validation layers (frontend, API, database)
- **Error Handling**: Comprehensive error handling and user feedback
- **Data Integrity**: Foreign key constraints and data validation
- **Performance**: Optimized queries and efficient data structures

## 📊 Sample Data

The application starts with a clean database. Sample data can be enabled by uncommenting the sample data loading in `scripts/database.js`. The sample includes:
- **Teachers**: Multi-instrument teachers with different specialties
- **Students**: Students with various referral sources
- **Lessons**: Completed and upcoming lesson examples
- **Payments**: Sample payment records with platform fees
- **Availability**: Teacher availability examples

## 🚀 Getting Started

### **Quick Demo**
1. Start the server: `node server.js`
2. Open http://localhost:3000
3. Register as a teacher and student
4. Set availability and book lessons
5. Complete lessons to see payment processing
6. Check admin dashboard for analytics

### **Full Workflow**
1. **Teacher Setup**: Register → Set availability → Add bank account
2. **Student Setup**: Register → Add credit card → Browse lessons
3. **Booking Process**: Select lesson → Choose instrument → Confirm booking
4. **Lesson Completion**: Teacher marks complete → Payment processed
5. **Analytics**: Admin views comprehensive reports and revenue data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions, please open an issue on GitHub or contact the development team.

## 🎯 Project Status

**✅ Complete Features:**
- Multi-user registration and authentication
- Comprehensive lesson booking system
- Advanced payment processing with validation
- Multi-instrument support for teachers
- Real-time availability management
- Complete admin dashboard with analytics
- Interactive calendar system
- Revenue tracking and reporting
- Student referral analytics
- Teacher earnings management

**🔮 Future Enhancements:**
- Real payment gateway integration
- File upload for sheet music
- Video call integration
- Mobile app development
- Advanced search and filtering
- Email notifications
- Review and rating system

---

**Note**: This is a comprehensive demo application showcasing a complete music lesson booking platform. The system includes all core features needed for a production environment, with simulated payment processing for demonstration purposes. In a live environment, you would integrate with real payment gateways and add additional security measures.
