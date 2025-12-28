import axios from "axios";

export const sendOtpEmail = async (email, otp) => {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Divyaveda",
        email: "singhalanvit534@gmail.com" // MUST be verified
      },
      to: [{ email }],
      subject: "Your OTP for Registration",
      htmlContent: `
        <h3>OTP Verification</h3>
        <p>Your OTP is <b>${otp}</b></p>
        <p>This OTP is valid for 5 minutes.</p>
      `
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }
  );

  return response.data;
};
