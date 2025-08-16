# Smart Emergency Room Management System

A comprehensive, full-stack web application that leverages **Machine Learning** and **Real-time Analytics** to optimize emergency room operations, predict patient influx, and enhance healthcare delivery efficiency.

## Project Overview

**Smart ER** is an intelligent emergency room management platform that combines modern web technologies with predictive analytics to help healthcare professionals make data-driven decisions. The system provides real-time monitoring, patient prediction models, and comprehensive dashboard analytics to improve emergency room efficiency and patient care quality.

## Key Features

### Authentication & User Management
- Secure login system with JWT tokens
- Role-based access control (Doctors, Nurses, Supervisors)
- Hospital-specific user management
- Password encryption with bcrypt

### Real-time Dashboard
- Live patient count monitoring
- Bed availability tracking
- ER status indicators (Low/Moderate/High/Critical)
- Real-time patient discharge management
- Interactive charts and visualizations

### Machine Learning Predictions
- **Patient Influx Prediction**: Forecasts daily patient counts using Random Forest Regression
- **Critical Case Prediction**: Estimates expected critical cases
- **Resource Planning**: Predicts additional bed requirements
- **Monthly Trend Analysis**: Visualizes patient patterns across months

### Patient Management
- Comprehensive patient entry system
- Triage level classification (Low/Medium/High/Critical)
- Patient demographics and medical data tracking
- Automated discharge processing

### Smart Notifications
- Real-time alert system
- Unread notification tracking
- Automated updates for critical events
- Hospital-wide communication

### Advanced Analytics
- Interactive Chart.js visualizations
- Patient trend analysis
- Performance metrics tracking
- Exportable reports and data

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive data visualizations

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database

### Machine Learning Services
- **Python 3.x** - ML model development
- **Flask** - ML service API framework
- **Scikit-learn** - Machine learning algorithms
- **Random Forest Regressor** - Prediction model
- **Pandas** - Data manipulation
- **Matplotlib/Seaborn** - Data visualization
- **Joblib** - Model serialization
  
  ## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │   Backend       │    │   ML Pipeline    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (Flask)        │
│                 │    │                 │    │                  │
│ • Dashboard     │    │ • REST API      │    │ • Data Processing│
│ • Patient Entry │    │ • Authentication│    │ • Model Training │
│ • Predictions   │    │ • Database      │    │ • Predictions    │
│ • Analytics     │    │ • Real-time     │    │ • CSV Management │
└─────────────────┘    └─────────────────┘    └──────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB Atlas │
                    │   (Cloud DB)    │
                    └─────────────────┘
```
