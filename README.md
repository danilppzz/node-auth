## Description

This project is a simple web application built with Express.js that includes user authentication and authorization using JSON Web Tokens (JWT). It uses EJS as the templating engine and manages cookies for session handling. It also includes a local database implementation using `db-local` for user data storage and `bcrypt` for password hashing.

## Features

- User registration
- User login
- JWT-based authentication
- Middleware for session handling
- Cookie management
- Protected routes

## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Set up configuration:**

    Create a `config.js` file in the root directory with the following content:

    ```javascript
    export const SECRET_JWT_KEY = "your-secret-key";
    export const PORT = 3000;
    export const SALT_ROUNDS = 10;
    ```

4. **Run the application:**

    ```bash
    pnpm run dev
    ```

## Usage

### Endpoints

- **GET /**: Renders the homepage. If the user is logged in, user details are passed to the view.
- **POST /login**: Logs in a user and sets a JWT token in an HTTP-only cookie.
- **POST /register**: Registers a new user.
- **POST /logout**: Logs out the user by clearing the JWT cookie.
- **GET /protected**: Accesses a protected route. If the user is not authenticated, it returns a 403 status.

### Middleware

The middleware checks for a JWT token in the cookies. If the token is valid, it attaches the user data to the session.
