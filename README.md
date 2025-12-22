# Foreign Language Center Management System - Admin Portal

## Overview

Welcome to the **Foreign Language Center Management System (Admin Portal)**. This is a comprehensive web application designed to streamline the operations of a foreign language center. Built with **React** and **TypeScript**, this portal serves as the central hub for administrators, staff, and teachers to manage courses, students, schedules, financials, and academic performance efficiently.

The system is tailored to enhance productivity by providing intuitive interfaces for complex administrative tasks and ensuring seamless communication between managing staff and the teaching faculty.

## Key Features

### 🏢 For Administrators & Staff
The Admin interface provides robust tools to manage the center's core resources and operations:

*   **Dashboard & Analytics**: Visualize key performance indicators, enrollment statistics, and revenue trends.
*   **Student Management**: 
    *   Full lifecycle management: Add, edit, and view student profiles.
    *   Enrollment processing and class assignment.
*   **Course & Class Management**:
    *   Create and manage course categories and detailed course pathways.
    *   Schedule classes, assign rooms, and manage capacity.
*   **Teacher Management**:
    *   Recruit and onboard new teachers.
    *   Manage teacher profiles, qualifications, and employment details.
*   **Financial & Promotions**:
    *   Invoice generation and payment tracking.
    *   Management of promotional campaigns and discounts.
*   **Facilities Management**: Manage room availability and scheduling.

### 👨‍🏫 For Teachers
The Teacher Portal empowers instructors to focus on delivering quality education:

*   **Personal Dashboard**: Quick view of upcoming schedules and active classes.
*   **Class & Schedule Management**:
    *   Access detailed class lists and student information.
    *   View personal teaching schedules in real-time.
*   **Academic Tools**:
    *   **Attendance Tracking**: Digital attendance taking for every session.
    *   **Score Management**: Input and manage student grades and assessment results.
*   **Profile Management**: Update personal information and view teaching history.

## 🛠 Technology Stack

This project leverages a modern and robust technology stack to ensure performance, scalability, and developer experience:

*   **Core Framework**: [React 18+](https://reactjs.org/) (with Hooks and Functional Components)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (for static typing and code reliability)
*   **UI Library**: [Material UI (MUI)](https://mui.com/) (for professional, responsive, and accessible components)
*   **State Management & Data**: 
    *   [Axios](https://axios-http.com/) (API integration)
    *   Context API / Custom Hooks
*   **Form Handling**: [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup) (Validation)
*   **Date & Time**: [Day.js](https://day.js.org/)
*   **Visualization**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
*   **Others**: `jwt-decode` (Auth), `qrcode.react` (Check-in), `react-router-dom` (Navigation).

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
*   **Node.js** (v14 or higher recommended)
*   **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd quan_ly_trung_tam_ngoai_ngu_admin
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    *   Create a `.env` file in the root directory if it doesn't await exist.
    *   Configure your API endpoints and other environment variables (e.g., `REACT_APP_API_URL`).

### Running the Application

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

## 📂 Project Structure

```
src/
├── api/            # API configuration and interceptors
├── auth/           # Authentication logic (Guards, Context)
├── component/      # Reusable UI components
├── hook/           # Custom React hooks
├── model/          # TypeScript interfaces and types
├── pages/          # Application pages (Views)
│   ├── admin/      # Admin-facing pages
│   └── teacher/    # Teacher-facing pages
├── routes/         # Routing definition
├── services/       # API integration services
├── util/           # Utility functions
└── layouts/        # Page layout wrappers (e.g., DashboardLayout)
```

---
Designed and developed for high-efficiency educational management.
