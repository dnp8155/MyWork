/**
 * Service to send project invite emails via Resend API
 */
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";

export async function sendProjectInvitationEmail({ toEmail, toName, projectName, projectId, inviterName }) {
  if (!toEmail) return { success: false, error: "Recipient email is required" };

  const joinUrl = `${window.location.origin}/projects/${projectId}/shared?invitedEmail=${encodeURIComponent(toEmail)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Project Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding: 40px 15px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 520px; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
              <tr>
                <td style="height: 6px; background: linear-gradient(90deg, #2563eb, #38bdf8);"></td>
              </tr>
              <tr>
                <td align="center" style="padding: 35px 30px 15px 30px;">
                  <img src="https://media.base44.com/images/public/6aa4049391d33a443027588d/3321c12ed_ChatGPTImageSep11202607_58_37PM.png" alt="MyWork Logo" style="max-width: 180px; width: 100%; height: auto; border-radius: 10px;" />
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 10px 35px 0 35px;">
                  <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 10px 0;">You've been invited! 🎉</h1>
                  <p style="color: #475569; font-size: 15px; line-height: 24px; margin: 0 0 24px 0;">
                    Hello <strong>${toName || "there"}</strong>,<br/>
                    <strong>${inviterName || "A team member"}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> on MyWork.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 0 35px 30px 35px;">
                  <a href="${joinUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
                    Join Project Workspace →
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 35px;">
                  <div style="border-top: 1px solid #f1f5f9;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 35px; background: #f8fafc;">
                  <p style="color: #64748b; font-size: 12px; line-height: 18px; margin: 0;">
                    If you don't have an account yet, clicking the button will let you register and instantly access this shared workspace.
                  </p>
                </td>
              </tr>
            </table>
            <table width="100%" style="max-width: 520px; margin-top: 20px;">
              <tr>
                <td align="center" style="color: #94a3b8; font-size: 12px;">
                  © 2026 MyWork • dipakpatel.site
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
        subject: `Invitation: Join "${projectName}" workspace`,
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
