import { env } from "../../../config/env.js";

interface VerifyAccountEmailData {
  fullName: string;
  verificationLink: string;
  expiryText: string;
}

export function verifyAccountEmailHtml({
  fullName,
  verificationLink,
  expiryText,
}: VerifyAccountEmailData): string {
  const year = new Date().getFullYear();

  return `
    <!doctype html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />

        <title>Verify your email</title>

        <!--[if mso]>
          <style>
            body,
            table,
            td,
            p,
            a,
            h1 {
              font-family: Arial, sans-serif !important;
            }
          </style>
        <![endif]-->
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        "
      >
        <!-- Preheader -->
        <div
          style="
            display: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            color: #1a1e23;
            mso-hide: all;
            font-size: 1px;
            line-height: 1px;
          "
        >
          Action required: Verify your ${env.APP_NAME} account.
        </div>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width: 100%;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width: 100%; max-width: 600px"
              >
                <tr>
                  <td
                    style="
                      padding: 32px;
                      border: 1px solid #dadce0;
                      border-radius: 8px;
                      font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        &quot;Segoe UI&quot;,
                        Arial,
                        sans-serif;
                    "
                  >
                    <!-- Heading -->
                    <h1
                      style="
                        margin: 0 0 24px;
                        padding: 0;
                        font-size: 24px;
                        line-height: 32px;
                        font-weight: 600;
                        color: #0f1214;
                      "
                    >
                      Verify your email
                    </h1>

                    <!-- Greeting -->
                    <p
                      style="
                        margin: 0 0 16px;
                        padding: 0;
                        font-size: 14px;
                        line-height: 24px;
                        color: #0f1214;
                        font-weight: 500;
                      "
                    >
                      Hi ${fullName},
                    </p>

                    <!-- Message -->
                    <p
                      style="
                        margin: 0 0 28px;
                        padding: 0;
                        font-size: 14px;
                        line-height: 24px;
                        color: #0f1214;
                      "
                    >
                      Thank you for creating a ${env.APP_NAME} account. Click
                      the button below to verify your email address and
                      complete your registration.
                    </p>

                    <!-- CTA -->
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td
                          align="center"
                          bgcolor="#08728d"
                          style="
                            border-radius: 6px;
                          "
                        >
                          <a
                            href="${verificationLink}"
                            target="_blank"
                            style="
                              display: inline-block;
                              padding: 12px 24px;
                              border-radius: 6px;
                              background-color: #08728d;
                              color: #ffffff;
                              font-family:
                                Inter,
                                -apple-system,
                                BlinkMacSystemFont,
                                &quot;Segoe UI&quot;,
                                Arial,
                                sans-serif;
                              font-size: 14px;
                              line-height: 20px;
                              font-weight: 500;
                              text-decoration: none;
                            "
                          >
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-top: 32px"
                    >
                      <tr>
                        <td>
                          <p
                            style="
                              margin: 0 0 8px;
                              padding: 0;
                              font-size: 12px;
                              line-height: 20px;
                              color: #1a1e23;
                            "
                          >
                            If the button doesn't work, copy and paste this URL into your browser:
                          </p>

                          <p
                            style="
                              margin: 0;
                              padding: 0;
                              font-size: 12px;
                              line-height: 20px;
                              word-break: break-all;
                            "
                          >
                            <a
                              href="${verificationLink}"
                              target="_blank"
                              style="
                                color: #08728d;
                                font-weight: 500;
                                text-decoration: none;
                              "
                            >
                              ${verificationLink}
                            </a>
                          </p>

                          <p
                            style="
                              margin: 20px 0 0;
                              padding: 0;
                              font-size: 12px;
                              line-height: 20px;
                              color: #1a1e23;
                            "
                          >
                            For security reasons, this verification link will
                            expire in
                            <span style="font-weight: 500">${expiryText}</span>.
                          </p>

                          <p
                            style="
                              margin: 8px 0 0;
                              padding: 0;
                              font-size: 12px;
                              line-height: 20px;
                              color: #1a1e23;
                            "
                          >
                            If you did not create a ${env.APP_NAME} account,
                            you can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer (outside the card) -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width: 100%; max-width: 600px; margin: 24px 0px"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        &quot;Segoe UI&quot;,
                        Arial,
                        sans-serif;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        padding: 0;
                        font-size: 11px;
                        color: #1a1e23;
                      "
                    >
                      &copy; ${year} ${env.APP_NAME}. All rights reserved.
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        padding: 0;
                        font-size: 11px;
                        color: #1a1e23;
                      "
                    >
                      You received this email because an account was created
                      using this email address.
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        padding: 0;
                        font-size: 11px;
                      "
                    >
                      <a
                        href="${env.CLIENT_URL}/privacy"
                        target="_blank"
                        style="
                          color: #08728d;
                          text-decoration: none;
                        "
                      >
                        Privacy Policy
                      </a>

                      <span style="color: #1a1e23">
                        &nbsp;&middot;&nbsp;
                      </span>

                      <a
                        href="${env.CLIENT_URL}/terms"
                        target="_blank"
                        style="
                          color: #08728d;
                          text-decoration: none;
                        "
                      >
                        Terms
                      </a>

                      <span style="color: #1a1e23">
                        &nbsp;&middot;&nbsp;
                      </span>

                      <a
                        href="${env.CLIENT_URL}/support"
                        target="_blank"
                        style="
                          color: #08728d;
                          text-decoration: none;
                        "
                      >
                        Support
                      </a>
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
}
