# AI-Powered Interview Assistant (Crisp)

This is a React application that serves as an AI-powered interview assistant. It provides a seamless experience for both the candidate (interviewee) and the recruiter (interviewer), with features for resume parsing, automated interviews, and a comprehensive dashboard.

## Features

- **Two-Tab Interface:** Separate, synced views for the interviewee and interviewer.
- **Resume Parsing:** Upload a PDF resume to automatically extract the candidate's name, email, and phone number.
- **Chatbot for Missing Info:** A friendly chatbot collects any details that couldn't be extracted from the resume.
- **Timed AI Interview:** A simulated AI conducts a timed interview with questions of varying difficulty.
- **Interviewer Dashboard:** A dashboard for recruiters to view a list of candidates, sorted by score, with search and detailed view capabilities.
- **Local Persistence:** All progress is saved locally, so you can close and reopen the browser without losing your session.
- **Welcome Back Modal:** A modal greets users with an in-progress session, allowing them to continue or restart.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd crisp-interview-assistant
    ```

3.  **Install the dependencies:**
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```sh
npm run dev
```

The application will be available at `http://localhost:5173`.

## Technologies Used

- **React:** The core front-end library.
- **Vite:** A fast build tool for modern web development.
- **Redux Toolkit:** For predictable state management.
- **Redux Persist:** To persist the Redux store to local storage.
- **Ant Design (AntD):** A comprehensive UI component library.
- **React Router:** For handling client-side routing.
- **pdf.js:** For parsing PDF resumes in the browser.

