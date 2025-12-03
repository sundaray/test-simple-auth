import { resend } from "@/lib/resend";
import { PasswordResetTemplate } from "@/components/password-reset-template";

export async function sendPasswordResetEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  await resend.emails.send({
    from: "auth@hemantasundaray.com",
    to: [email],
    subject: "Reset your password",
    react: PasswordResetTemplate({
      email,
      resetUrl: url,
    }),
  });
}
