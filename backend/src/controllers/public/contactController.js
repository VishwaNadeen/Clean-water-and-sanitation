import { sendEmail } from "../../services/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message is too short." });
    }

    const toAddress = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER;
    if (!toAddress) {
      return res.status(500).json({
        message: "Contact email receiver is not configured.",
      });
    }

    const emailSubject = `[Contact Form] ${subject}`;
    const emailText = [
      "New contact form submission",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    await sendEmail({
      to: toAddress,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    return res.status(200).json({
      message: "Message sent successfully. Our team will contact you soon.",
    });
  } catch (error) {
    console.error("Contact form submit failed:", error.message);
    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};
