import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

function createTransport() {
  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
  });
}

/**
 * Send email verification link to new blog member.
 */
export async function sendVerificationEmail({
  to,
  username,
  token,
  origin,
}: {
  to: string;
  username: string;
  token: string;
  origin: string;
}): Promise<void> {
  const verifyUrl = `${origin}/verify-email?token=${token}`;

  const transporter = createTransport();

  await transporter.sendMail({
    from: ENV.smtpFrom || `"SPJ Fishing Blog" <noreply@spj-fishing.com>`,
    to,
    subject: "【SPJ Fishing Blog】メールアドレスの確認",
    text: `
${username} 様

SPJ Fishing Blogへのご登録ありがとうございます。

以下のURLをクリックして、メールアドレスの確認を完了してください。
このURLの有効期限は24時間です。

${verifyUrl}

このメールに心当たりのない場合は、無視していただいて構いません。

---
SPJ Fishing Blog
https://spj-fishing.com
`.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111827;border:1px solid #1e3a4a;border-radius:4px;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header accent line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#00d4b8,rgba(0,212,184,0.3),transparent);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#00d4b8;font-family:monospace;">Slow Pitch Jigging</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:bold;color:#ffffff;">SPJ Fishing Blog</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#9ca3af;line-height:1.7;">${username} 様</p>
              <p style="margin:0 0 16px;font-size:15px;color:#9ca3af;line-height:1.7;">
                SPJ Fishing Blogへのご登録ありがとうございます。<br>
                以下のボタンをクリックして、メールアドレスの確認を完了してください。
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">このURLの有効期限は<strong style="color:#9ca3af;">24時間</strong>です。</p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="background-color:#00d4b8;border-radius:2px;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#0a0f1a;text-decoration:none;letter-spacing:0.05em;">
                      メールアドレスを確認する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください：</p>
              <p style="margin:0;font-size:12px;word-break:break-all;">
                <a href="${verifyUrl}" style="color:#00d4b8;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e3a4a;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                このメールに心当たりのない場合は、無視していただいて構いません。<br>
                © 2026 SPJ Fishing Blog
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
  });
}
