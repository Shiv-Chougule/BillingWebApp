
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, subject, message } = await req.json();

    // Create transporter
    let transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Email options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);

    return Response.json({ success: true, info });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
