# GoCRM: Multi-Tenant AI CRM

## Project Introduction

Welcome to GoCRM, a Customer Relationship Management (CRM) platform designed to connect software development with real-world business needs.

This platform is based on multi-tenant architecture integrated with Artificial Intelligence. Whether you are a Sales Representative managing a busy pipeline or an Admin needing a complete view of workspace analytics, GoCRM delivers a solid, data-driven experience.

## Motivation

The motivation behind GoCRM is to provide small-scaled businesses with a tool that fits naturally into how they already communicate. Most small businesses talk to their clients directly through WhatsApp. Instead of forcing customers to fill out long forms on a website, GoCRM captures leads right where the conversation happens. 

By using WhatsApp as the main point for getting leads, businesses can automate lead generation, track customer interactions easily, and close deals faster without leaving their preferred chat app. This project exists to make smart automation accessible and straightforward for small business owners.

## Screenshots

Here is a look at the different parts of the application:

* **Login Page:** ![Login Page Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.40.34.png)
* **Admin Dashboard:** ![Admin Dashboard Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.41.24.png)
* **User Dashboard:** ![User Dashboard Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.41.32.png)
* **Kanban Board:** ![Kanban Board Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.42.36.png)
* **Leads Page:** ![Leads Page Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.42.42.png)
* **Chat Page:** ![Chat Page Screenshot Here](https://github.com/PrashantMaht0/GoCRM/blob/main/go-crm-frontend/src/assets/screenshots/Screenshot%202026-06-30%20at%2001.42.26.png)

## Project Overview and Features

GoCRM is built with a clean MVC architecture. It provides distinct, secure environments for different user roles while automating data analysis using large language models.

### Core Features

* **Multi-Tenant Architecture:** Isolated workspace environments allowing Admins to manage multiple companies while keeping Sales Reps restricted to their own assigned data.

* **AI Executive Insights:** A built-in AI assistant that looks at workspace metrics (revenue, top performers, support backlogs) to write helpful performance reviews.

* **WhatsApp Webhook Integration:** Seamless integration with the WhatsApp Business API to automatically capture and log new leads directly into the CRM pipeline.

* **Interactive Data Visualization:** Real-time dashboards featuring dual-axis charts and revenue leaderboards to track daily sales against monthly targets.

* **Enterprise-Grade Security:**
  * **Role-Based Access Control:** Security rules preventing unauthorized access to admin metrics.
  * **JWT Authentication:** Secure session management for logging in.
  * **API Defense:** Global exception handling to prevent data leaks, input validation, and rate-limiting to protect backend resources.

## Tech Stack and APIs

GoCRM uses a modern and reliable technology stack:

### Frontend

* **React.js & Vite:** Fast frontend build tooling and component rendering.
* **Tailwind CSS:** Utility styling for a clean, responsive user interface.
* **Recharts:** Charting library for rendering sales dashboards.
* **React Router:** Client-side routing for smooth navigation.

### Backend

* **Java & Spring Boot:** The backbone of the application, handling APIs, security, and business logic.
* **Spring Security & JWT:** Authentication and endpoint protection.
* **Spring AI:** Framework for integrating Large Language Models into Java applications.
* **Bucket4j:** API rate limiting to protect system resources.

### Database & Infrastructure

* **PostgreSQL (Supabase):** Scalable database handling user data, pipelines, and configuration settings.
* **Docker & Docker Compose:** Containerization for consistent deployment across any environment.

## Getting Started: Setup and Running Instructions

You can run GoCRM locally on your machine using standard package managers or via Docker.

### Prerequisites

* Java 21+ and Maven
* Node.js 20+ and npm
* A PostgreSQL instance (or Supabase account)
* Docker & Docker Compose (Optional)

### Option 1: Standard Local Setup

1. **Clone the repository:**
 ```bash
git clone https://github.com/PrashantMaht0/GoCRM.git
cd GoCRM
```

2. **Setup the Backend:**
     - Navigate to the core service folder:
    ```bash
    cd go-crm-core-service
    ```
     - Configure your .env file or application.yml with your Supabase credentials and JWT Secret.
     - Run the Spring Boot application:
    ```bash
    mvn spring-boot:run
    ```

3. **Setup the Frontend:**
     - Open a new terminal and navigate to the frontend folder:
    ```bash
    cd go-crm-frontend
    ```
     - Install dependencies:
    ```bash
     npm install
    ```
     - Start the Vite development server:
    ```bash
    npm run dev
    ```
     - Access the application at http://localhost:5173

### Option 2: Docker Deployment

If you have Docker installed, you can spin up the entire stack with a single command. The application uses an Nginx proxy to serve the frontend and connect it to the Spring Boot backend.

Ensure your .env file is present in the go-crm-core-service directory.

From the root project directory, run:

```bash
docker-compose up --build -d
```

Access the application at http://localhost

## Setting Up the Meta WhatsApp App

To use the WhatsApp integration, you must create a Meta app and retrieve your API configurations before starting the backend server.

* Go to the Meta for Developers portal and click Create App.
* Select Other for the use case, then choose Business as the app type.
* Add the WhatsApp product to your new application from the dashboard.
* Navigate to the API Setup tab under the WhatsApp product menu.
* Copy your Phone Number ID and the access token (you can create a System User in Business Settings for a permanent token).
* Navigate to the Configuration tab under WhatsApp to set up your Webhook.
* Enter your backend server URL (use a tool like ngrok if you are testing locally) and the custom Verify Token you intend to save in the GoCRM database.
* Click Manage under Webhook fields and subscribe to the messages event.
* Add these credentials to your backend environment variables and database configuration.

## Future Work

This project covers a lot of ground, but there are always ways to improve it. Here are a few things planned for the future:

- Google SSO: Using Google Account for easier signup.
- Better UI: Polishing the design and layout to make the application even more intuitive and accessible for everyday users.
- Advanced Analytical Features: Adding deeper reporting tools, such as predicted revenue trends, win/loss ratios, and custom date filters for the dashboard charts.
- More Automation: Implementing automated follow-up messages on WhatsApp when a lead changes pipeline stages, and setting up weekly automated email reports for admins.

## How to Contribute and Report Issues

Contributions are welcome! If you want to contribute, please follow these steps:

1. Fork the Repository: Create your own branch from main.
2. Create a Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your Changes: Write clear commit messages.
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request: Describe the changes you made and the problem they solve.

## Reporting Issues

If you find a bug or have a feature request, please use the GitHub Issues tab. Include the following in your report:

- A clear title.
- Steps to reproduce the bug.
- Expected vs. actual behavior.
- Screenshots or error logs if you have them.
