/**
 * Service to send project invite emails via Resend API
 */
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";

export async function sendProjectInvitationEmail({ toEmail, toName, projectName, projectId, inviterName }) {
  if (!toEmail) return { success: false, error: "Recipient email is required" };

  const joinUrl = `${window.location.origin}/projects/${projectId}/shared?invitedEmail=${encodeURIComponent(toEmail)}`;

  const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Collaboration Invite</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05); overflow: hidden;">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #38bdf8 100%);"></td>
          </tr>

          <!-- Brand Logo Header -->
          <tr>
            <td align="center" style="padding: 36px 40px 16px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <img 
                      src="https://media.base44.com/images/public/6aa4049391d33a443027588d/3321c12ed_ChatGPTImageSep11202607_58_37PM.png" 
                      alt="MyWork" 
                      width="52" 
                      height="52" 
                      style="display: block; border-radius: 8px; object-fit: contain;" 
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 600; border-radius: 20px; margin-bottom: 8px;">
                Team Collaboration
              </span>
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 4px 0 10px 0; letter-spacing: -0.4px;">
                You've been invited to collaborate
              </h1>
              <p style="color: #64748b; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Hello <strong>${toName || "there"}</strong>,<br/>
                <strong>${inviterName || "A team administrator"}</strong> has invited you to join and collaborate on the project:
              </p>
            </td>
          </tr>

          <!-- Project Showcase Box -->
          <tr>
            <td style="padding: 0 40px 28px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td>
                    <div style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Project Workspace</div>
                    <div style="color: #0f172a; font-size: 17px; font-weight: 700; margin-top: 2px;">${projectName}</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Shared documents, tasks, and payout details</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #2563eb; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                    <a href="${joinUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
                      Accept Invite & Open Workspace →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #f1f5f9;"></div>
            </td>
          </tr>

          <!-- Direct URL Fallback -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fafbfc;">
              <p style="color: #64748b; font-size: 12px; line-height: 18px; margin: 0 0 6px 0;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin: 0; word-break: break-all;">
                <a href="${joinUrl}" target="_blank" style="color: #2563eb; font-size: 11px; text-decoration: underline;">
                  ${joinUrl}
                </a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Outer Footer -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin-top: 24px;">
          <tr>
            <td align="center" style="color: #94a3b8; font-size: 12px; line-height: 18px;">
              <p style="margin: 0 0 4px 0;">
                Don't have an account yet? Registering with this email will instantly grant you access to this workspace.
              </p>
              <p style="margin: 0; font-weight: 500;">
                © 2026 MyWork • <a href="https://dipakpatel.site" target="_blank" style="color: #64748b; text-decoration: none;">dipakpatel.site</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MyWork <onboarding@resend.dev>",
        to: [toEmail],
        subject: `You've been invited to join "${projectName}" on MyWork`,
        html: html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("Resend email warning:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}
