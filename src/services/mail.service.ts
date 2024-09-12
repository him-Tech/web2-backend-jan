import { ServerClient } from "postmark";

export class MailService {
  private client: ServerClient;

  constructor() {
    if (!process.env.POSTMARK_API_TOKEN) {
      throw new Error("POSTMARK_API_TOKEN is missing");
    } else if (!process.env.POSTMARK_SENDER_EMAIL) {
      throw new Error("POSTMARK_SENDER_EMAIL is missing");
    }

    this.client = new ServerClient(process.env.POSTMARK_API_TOKEN as string);
  }

  async sendMail(to: string, subject: string, text: string) {
    await this.client.sendEmail({
      From: process.env.POSTMARK_SENDER_EMAIL!, // TODO: refactor
      To: to,
      Subject: subject,
      TextBody: text,
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const subject = "Reset password";
    const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
    const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
    await this.sendMail(to, subject, text);
  }

  async sendVerificationEmail(to: string, token: string) {
    const subject = "Email Verification";
    const verificationEmailUrl = `http://localhost:3000/api/v1/auth/login/email/verify?token=${token}`;
    const text = `Dear user, To verify your email, click on this link: ${verificationEmailUrl}`;

    await this.sendMail(to, subject, text);
  }
}
