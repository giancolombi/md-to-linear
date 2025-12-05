import { parseMarkdown } from './lib/markdown-parser.ts';

const EXAMPLE_MARKDOWN = `# E-Commerce Platform
Build a modern e-commerce platform with full shopping capabilities and admin dashboard.

## User Authentication System
Implement a complete authentication system for customers and administrators.

### Implement login functionality
Create the login page with email/password fields and integrate with the backend API for user authentication. Include proper error handling and loading states.

### Add user registration
Build the registration flow with form validation, email verification, and secure password requirements. Connect to the user creation API endpoint.

### Create password reset feature
Implement forgot password functionality with email-based reset links and secure token validation.

## Shopping Cart Feature
Build a full-featured shopping cart with persistent storage.

### Add to cart functionality
Implement the ability to add products to cart with quantity selection.

### Cart persistence
Store cart data in local storage and sync with backend when user logs in.

### Checkout process
Create multi-step checkout flow with shipping and payment information.

# Mobile Application
Develop a cross-platform mobile application for iOS and Android.

## Core Features
Implement essential mobile app functionality.

### Push notifications
Set up push notification service for order updates and promotions.

### Offline mode
Enable basic browsing and cart functionality while offline.

## Performance Optimization
Optimize the mobile app for better performance.

### Image caching
Implement intelligent image caching to reduce data usage.

### API response caching
Cache frequently accessed data to improve app responsiveness.`;

const projects = parseMarkdown(EXAMPLE_MARKDOWN);
console.log(JSON.stringify(projects, null, 2));