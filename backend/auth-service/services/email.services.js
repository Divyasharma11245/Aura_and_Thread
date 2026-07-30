import transporter from "../config/mail.js";

export const sendEmail = async ({ to, subject, template }) => {
  try {
    const info = await transporter.sendMail({
      from: "divyasharma11245@gmail.com", // sender address
      to,
      subject, // subject line
      html: template,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
