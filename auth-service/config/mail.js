import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded" : "Missing");
const transporter = nodemailer.createTransport({
  service: "gmail", // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;
