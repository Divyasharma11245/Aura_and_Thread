const transporter = require('../config/mailer');

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Aura & Thread" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };