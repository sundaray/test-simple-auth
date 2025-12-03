import { resend } from "@/lib/resend";
import { EmailVerificationTemplate } from "@/components/email-verification-template";

export async function sendVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}): Promise<void> {
  await resend.emails.send({
    from: "auth@hemantasundaray.com",
    to: [email],
    subject: "Verify your email address",
    react: EmailVerificationTemplate({
      email,
      verificationUrl: url,
    }),
  });
}
