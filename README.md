# Aura & Thread

Aura & Thread is a microservices-based fashion e-commerce backend. The application is split into authentication, product catalog, API gateway, payment, and notification components.

## Architecture

| Component | Port | Responsibility |
| --- | ---: | --- |
| API gateway (`backend`) | 5001 | Public entry point and service proxy |
| Auth service | 5000 | Signup, login, email verification, JWT auth, and profiles |
| Product service | 3001 | Products, categories, search, uploads, and MongoDB catalog data |
| Payment/notification service | 5004 | Stripe payment intents and webhook handling |
| Email worker | - | Consumes RabbitMQ notifications and sends email |
| MongoDB | 27017 | Auth and product persistence |
| RabbitMQ | 5672 | Event transport |
| RabbitMQ management | 15672 | RabbitMQ administration UI |

Payment events use the following RabbitMQ contract:

- Exchange: `aura.events` (`topic`, durable)
- Routing key: `payment.created`
- Queue: `email_notifications` (durable)

## Prerequisites

- Docker Desktop with Docker Compose
- Stripe test credentials for payment flows
- SMTP credentials for email delivery
- Cloudinary credentials for product image uploads

## Configuration

Copy each environment template to a local `.env` file:

```bash
cp auth-service/.env.example auth-service/.env
cp backend/.env.example backend/.env
cp product-service/.env.example product-service/.env
cp payment-notification-service/.env.example payment-notification-service/.env
```

On Windows PowerShell:

```powershell
Copy-Item auth-service\.env.example auth-service\.env
Copy-Item backend\.env.example backend\.env
Copy-Item product-service\.env.example product-service\.env
Copy-Item payment-notification-service\.env.example payment-notification-service\.env
```

Set real values in the copied files. Do not commit `.env` files or credentials.

RabbitMQ credentials are supplied to Compose through the root environment. Create a root `.env` file with a strong password:

```env
RABBITMQ_DEFAULT_USER=aura
RABBITMQ_DEFAULT_PASS=replace-with-a-strong-password
```

Update `RABBITMQ_URL` in `backend/.env` and `payment-notification-service/.env` to include the same credentials:

```env
RABBITMQ_URL=amqp://aura:replace-with-a-strong-password@rabbitmq:5672
```

## Run with Docker Compose

Start all services, MongoDB, RabbitMQ, and the email worker:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up --build -d
```

Stop the stack:

```bash
docker compose down
```

To remove persisted MongoDB and RabbitMQ data as well:

```bash
docker compose down -v
```

RabbitMQ management is available at [http://localhost:15672](http://localhost:15672).

## API endpoints

The API gateway is available at `http://localhost:5001`.

### Authentication

Routes are proxied under `/api/auth`:

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify
POST /api/auth/forgot-password
PUT  /api/auth/reset-password
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
DELETE /api/auth/deleteUser
```

Protected routes accept either the login cookie or:

```text
Authorization: Bearer <jwt>
```

### Products and categories

Product routes are proxied under `/api/v1/product` and category routes under `/api/v1/category`.

```text
GET    /api/v1/product/get-all-products
GET    /api/v1/product/get-product/:id
GET    /api/v1/product/search?keyword=...
POST   /api/v1/product/create-product
PATCH  /api/v1/product/update-product/:id
DELETE /api/v1/product/delete-product/:id
GET    /api/v1/product/category/:slug

POST   /api/v1/category/create-category
GET    /api/v1/category/get-all-categories
GET    /api/v1/category/search?keyword=...
POST   /api/v1/category/get-category
PATCH  /api/v1/category/update-category/:id
DELETE /api/v1/category/delete-category/:id
```

Product creation accepts multipart form data with up to five files in the `images` field. Cloudinary variables must be configured for image uploads.

### Payments

```text
POST /api/payments/create-intent
POST /api/payments/webhook
GET  http://localhost:5004/health
```

Stripe webhook requests must be sent to the payment-notification service with the original raw JSON body and `stripe-signature` header. The webhook route is intentionally registered before `express.json()`.

## Local development without Docker

Install dependencies separately in each Node.js service:

```bash
cd auth-service && npm install
cd ../backend && npm install
cd ../product-service && npm install
cd ../payment-notification-service && npm install
```

Start MongoDB and RabbitMQ first, then run each service from its own directory:

```bash
npm start
```

Start the notification worker separately:

```bash
cd payment-notification-service
npm run worker
```

When running outside Compose, replace Docker hostnames such as `mongodb` and `rabbitmq` with `localhost` in the relevant `.env` files.

## Project structure

```text
auth-service/
backend/
product-service/
payment-notification-service/
docker-compose.yml
```

The repository intentionally keeps secrets out of source control. Use the `.env.example` files as templates only.
