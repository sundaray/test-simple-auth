import { resend } from "@/lib/resend";
import { PasswordChangeConfirmationTemplate } from "@/components/password-change-confirmation-template";

export async function sendPasswordUpdateEmail({ email }: { email: string }) {
  await resend.emails.send({
    from: "auth@hemantasundaray.com",
    to: [email],
    subject: "Password changed successfully",
    react: PasswordChangeConfirmationTemplate({
      email,
    }),
  });
}
