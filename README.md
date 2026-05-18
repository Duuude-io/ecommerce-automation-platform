# ecommerce-automation-platform
Event-driven e-commerce system with authentication and automation workflows.

## Overview
This project is a full-stack e-commerce system built with a focus on automation and scalable backend architecture.

Instead of placing logic directly inside API routes, the system uses an **event-driven automation engine** that triggers workflows automatically.

---

## Features

- Multi-step authentication system
- OTP verification (Email & Phone)
- Resume signup sessions
- Event dispatcher automation system
- Order processing automation
- User onboarding workflows

---

## Architecture

User → Frontend → FastAPI Backend → Event Dispatcher → Automation Handlers

---

## Automation System

The application emits events such as:

- USER_CREATED
- ORDER_CREATED
- ORDER_CANCELLED

Automation handlers listen to these events and perform background actions like:

- Sending welcome emails
- Sending SMS notifications
- Logging analytics
- Triggering workflows

---

## Tech Stack

- FastAPI (Python)
- JavaScript
- HTML/CSS
- REST APIs
- Event-Driven Architecture

---

## Project Status

🚧 Active Development  
Currently expanding automation workflows and system scalability.

---

## Author

Oladokun Adeyemi
Automation & Backend Engineer.
