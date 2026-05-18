## E-Commerce Automation Platform (Amazon Clone)

A full-stack e-commerce system that simulates real-world shopping flows including authentication, OTP verification, cart management, and order processing.

This project was built to practice backend architecture, authentication flows, and frontend-backend integration using FastAPI and JavaScript.

🚀 Features

## Authentication System
Multi-step signup flow
OTP verification (email + phone simulation)
Session-based authentication handling
Resume signup support

## E-Commerce System
Product listing system
Add to cart / remove items
Cart persistence logic
Checkout flow simulation

## Order System
Order creation endpoint
Order history tracking
Order summary rendering

## Backend Architecture
-FastAPI REST API
-Event-driven structure (internal automation system)
-JSON-based temporary storage (dev phase)

## Architecture Overview
Frontend (JavaScript UI)
        ↓
FastAPI Backend
        ↓
Auth System → Cart System → Order System
        ↓
Event Dispatcher (Automation Layer)

## Tech Stack
-FastAPI (Python)
-JavaScript (Frontend logic)
-HTML / CSS
-SON (temporary storage)
-Event-driven backend design

## How to Run
Backend:

cd backend
venv\Scripts\activate
uvicorn main:app --reload

Server runs at:
http://127.0.0.1:8000

Frontend
Open:
amazon.html
or use VS Code Live Server

## Project Status

* In active development

Core systems implemented:
Authentication flow
Cart system
Order processing

## Future improvements:

-Real database integration
-Payment gateway
-Email/SMS services (production)


## Purpose of This Project

This project demonstrates:

--full-stack system design thinking
--backend architecture structuring
--frontend-backend communication
--event-driven system design concepts


## Author

Built by a developer focused on building production-level backend systems and scalable e-commerce architecture.

## Duude_io.