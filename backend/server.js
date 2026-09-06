import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import amqp from "amqplib";
dotenv.config();

const PORT = Number(process.env.PORT || 5001);
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://payment-notification-service:5004";
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://auth-service:5000";
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://product-service:3001";
const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EVENT_EXCHANGE = "aura.events";
const PAYMENT_CREATED_ROUTING_KEY = "payment.created";
const EMAIL_NOTIFICATION_QUEUE = "email_notifications";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ service: "API Gateway", status: "Active" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ service: "API Gateway", status: "Active" });
});

let rabbitConnection;
let rabbitChannel;

const connectRabbitMQ = async () => {
  rabbitConnection = await amqp.connect(RABBITMQ_URL);
  rabbitChannel = await rabbitConnection.createConfirmChannel();
  await rabbitChannel.assertExchange(EVENT_EXCHANGE, "topic", { durable: true });
  await rabbitChannel.assertQueue(EMAIL_NOTIFICATION_QUEUE, { durable: true });
  await rabbitChannel.bindQueue(
    EMAIL_NOTIFICATION_QUEUE,
    EVENT_EXCHANGE,
    PAYMENT_CREATED_ROUTING_KEY,
  );
  rabbitConnection.on("close", () => {
    rabbitConnection = undefined;
    rabbitChannel = undefined;
  });
  console.log("Connected to RabbitMQ");
};

const publishPaymentCreated = async (payment) => {
  if (!rabbitChannel) {
    throw new Error("RabbitMQ is not connected");
  }

  const email = payment.email || payment.receipt_email;
  const orderId = payment.orderId || "N/A";
  const amount = Number(payment.amount || 0).toFixed(2);
  const currency = String(payment.currency || "usd").toUpperCase();
  const event = {
    event: PAYMENT_CREATED_ROUTING_KEY,
    paymentIntentId: payment.paymentIntentId,
    orderId,
    email,
    subject: `Payment Created - Order #${orderId}`,
    htmlContent: `<p>Payment for order <strong>#${orderId}</strong> was created.</p>
      <p>Amount: ${amount} ${currency}</p>`,
    createdAt: new Date().toISOString(),
  };

  rabbitChannel.publish(
    EVENT_EXCHANGE,
    PAYMENT_CREATED_ROUTING_KEY,
    Buffer.from(JSON.stringify(event)),
    { persistent: true, contentType: "application/json" },
  );
  await rabbitChannel.waitForConfirms();
};

const proxyTo = (serviceUrl) => async (req, res) => {
  try {
    const headers = { "content-type": req.get("content-type") || "application/json" };
    if (req.get("authorization")) headers.authorization = req.get("authorization");
    if (req.get("cookie")) headers.cookie = req.get("cookie");
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const response = await fetch(`${serviceUrl}${req.originalUrl}`, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    if (response.headers.get("set-cookie")) {
      res.setHeader("set-cookie", response.headers.get("set-cookie"));
    }
    return res.status(response.status).send(body);
  } catch (error) {
    console.error("Gateway proxy error:", error);
    return res.status(502).json({
      success: false,
      message: "Downstream service is unavailable",
    });
  }
};

app.use("/api/auth", proxyTo(AUTH_SERVICE_URL));
app.use("/api/v1/product", proxyTo(PRODUCT_SERVICE_URL));
app.use("/api/v1/category", proxyTo(PRODUCT_SERVICE_URL));

app.post("/api/payments/create-intent", async (req, res) => {
  try {
    const paymentResponse = await fetch(
      `${PAYMENT_SERVICE_URL}/api/payments/create-intent`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req.body),
      },
    );
    const responseBody = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return res.status(paymentResponse.status).json(responseBody);
    }

    await publishPaymentCreated({
      paymentIntentId: responseBody.paymentIntentId,
      orderId: req.body.orderId,
      email: req.body.email,
      amount: req.body.amount,
      currency: req.body.currency,
    });

    return res.status(paymentResponse.status).json(responseBody);
  } catch (error) {
    console.error("Payment gateway error:", error);
    return res.status(502).json({
      success: false,
      message: "Payment service or event broker is unavailable",
    });
  }
});

const start = async () => {
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("API Gateway failed to start:", error);
  process.exitCode = 1;
});
