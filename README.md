# DyDx Store — E-Commerce Automation Platform

DyDx Store is a full-stack e-commerce platform built to simulate real-world shopping workflows including secure authentication, OTP verification, cart persistence, checkout, payment flow simulation, and order processing.

This project was built to practice production-level backend architecture, authentication workflows, automation design, and frontend-backend integration using JavaScript and FastAPI.

## Live Demo

* Frontend: https://dydxstorefront.netlify.app
* Repository: https://github.com/Duuude-io/ecommerce-automation-platform

---

## Features

### Authentication System

* Multi-step signup flow
* Email & phone OTP verification
* JWT-based authentication
* Session persistence and recovery
* Resume signup support
* Password reset / account recovery

### E-Commerce System

* Product listing
* Add to cart / remove from cart
* Cart persistence across sessions
* Shipping & billing workflow
* Checkout flow simulation

### Payment System

* Multiple payment method simulation
* Saved payment methods
* Billing address management
* CVV verification for saved cards

### Order System

* Order creation endpoint
* Order history tracking
* Order summary rendering
* Order cancellation
* Delivery tracking preparation

### Automation System

Event-driven automation layer for backend workflows:

* User onboarding automation
* OTP dispatch events
* Order created events
* Order cancelled events
* Notification triggers

---

## System Architecture

Frontend (JavaScript UI)
↓
FastAPI Backend
↓
Authentication → Cart → Payment → Order
↓
Event Dispatcher (Automation Layer)

### Architecture Diagram

<img src="https://github.com/Duuude-io/ecommerce-automation-platform/blob/main/docs/architecture.png?raw=true" width="900"/>

This project follows a modular backend architecture using:

* Route Layer
* Repository Layer
* Authentication Layer
* Event Automation Layer

This structure improves maintainability and scalability as the system grows.

---

## Tech Stack

### Frontend

* JavaScript (ES6+)
* HTML5
* CSS3
* DOM Manipulation

### Backend

* Python
* FastAPI
* REST API Architecture
* Repository Pattern
* Event-Driven Automation

### Database

* PostgreSQL

### Deployment

* Netlify (Frontend)
* Render (Backend)

---

## How to Run Locally

### Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

Server runs at:

```bash
http://127.0.0.1:8000
```

### Frontend

Open:

```bash
index.html
```

Or use VS Code Live Server.

---

## Project Status

Currently in active development.

### Completed Core Systems

* Authentication flow
* Cart system
* Checkout workflow
* Payment flow simulation
* Order processing
* Automation event system

### Upcoming Improvements

* Real payment gateway integration
* Email/SMS production services
* Admin dashboard
* Analytics & reporting
* Product recommendation engine

---

## Purpose of This Project

This project demonstrates:

* Full-stack application architecture
* Backend system design
* Scalable API structuring
* Frontend-backend communication
* Authentication workflow design
* Event-driven system architecture

---

## Author

Built by **Oladokun Adeyemi**
Developer focused on building scalable backend systems, automation pipelines, and production-grade web applications.
