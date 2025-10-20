# Freelance Music Platform

A web platform connecting music teachers and students for online and in-person music lessons.

## Features

### For Students
- Browse and book music lessons
- Search by instrument and lesson type (virtual/in-person)
- Schedule recurring lessons
- Upload sheet music for lessons
- View lesson history and manage bookings

### For Teachers
- Create detailed profiles with photos and bio
- Set availability schedules
- Manage lesson pricing
- View booked lessons and student information

### For Admins
- View comprehensive reports and analytics
- Monitor revenue and user statistics
- Manage lesson bookings and user accounts

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.3
- **Backend**: Node.js, Express.js
- **Database**: SQLite (file-based, no server required)
- **Charts**: Chart.js for data visualization

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/freelance-music.git
   cd freelance-music
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Homepage: http://localhost:3000
   - Admin Portal: http://localhost:3000/admin-portal
   - Teacher Portal: http://localhost:3000/teacher-portal
   - Student Portal: http://localhost:3000/student-portal

## Database Setup

The application uses SQLite, which creates a local database file (`freelance_music.db`) automatically when you first start the server. The database includes:

- **Schema**: Defined in `data/init.sql`
- **Sample Data**: Populated from `data/sample_data.sql`
- **Operations**: Handled by `scripts/database.js`

### Database Structure

- **users**: Base table for all user types (students, teachers, admins)
- **teachers**: Extended profile information for music teachers
- **students**: Extended profile information for students
- **lessons**: Booked lesson records
- **availability**: Teacher schedule availability
- **payments**: Payment records (for future implementation)
- **reviews**: Student reviews (for future implementation)

## API Endpoints

### User Management
- `POST /api/signup/teacher` - Create new teacher account
- `POST /api/signup/student` - Create new student account
- `GET /api/admin/stats` - Get admin statistics

### Lessons
- `GET /api/lessons/available` - Get available lessons
- `POST /api/lessons/book` - Book a lesson
- `GET /api/student/:id/lessons` - Get student's lessons
- `GET /api/teacher/:id/lessons` - Get teacher's lessons

### Profiles
- `PUT /api/teacher/:id/profile` - Update teacher profile
- `PUT /api/student/:id/profile` - Update student profile

## File Structure

```
freelance-music/
├── data/
│   ├── init.sql              # Database schema
│   └── sample_data.sql       # Sample data
├── scripts/
│   ├── database.js           # Database operations
│   ├── main.js              # Homepage JavaScript
│   ├── admin-portal.js      # Admin portal functionality
│   ├── teacher-portal.js    # Teacher portal functionality
│   └── student-portal.js    # Student portal functionality
├── styles/
│   └── main.css             # Custom CSS styles
├── homepage.html            # Main landing page
├── admin-portal.html        # Admin interface
├── teacher-portal.html      # Teacher interface
├── student-portal.html      # Student interface
├── server.js                # Express server
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Development

### Adding New Features

1. **Database Changes**: Update `data/init.sql` for schema changes
2. **API Endpoints**: Add new routes in `server.js`
3. **Frontend**: Update HTML files and corresponding JavaScript files
4. **Styling**: Add custom CSS in `styles/main.css`

### Database Operations

The `Database` class in `scripts/database.js` provides methods for:
- User management (create, read, update)
- Lesson booking and management
- Availability scheduling
- Admin statistics and reporting

## Sample Data

The application comes with sample data including:
- 3 sample teachers (Piano, Guitar, Violin)
- 2 sample students
- Sample lesson availability
- Sample booked lessons

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub or contact the development team.

---

**Note**: This is a prototype/demo application for educational purposes. In a production environment, you would want to add authentication, payment processing, file upload handling, and additional security measures.
