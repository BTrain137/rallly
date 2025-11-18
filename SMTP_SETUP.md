# SMTP Configuration Guide for Rallly

Rallly uses Nodemailer for sending emails and supports SMTP and AWS SES. This guide will help you configure SMTP for production use.

## Current Setup

Your current `.env` is configured for **Mailpit** (development email testing tool):
- `SMTP_HOST=0.0.0.0` (Mailpit)
- `SMTP_PORT=1025` (Mailpit port)
- `SMTP_SECURE=false`

## SMTP Configuration Options

### Required Environment Variables

```bash
# Email Provider (smtp or ses)
EMAIL_PROVIDER=smtp

# SMTP Server Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587                    # Common: 587 (STARTTLS), 465 (SSL), 25 (plain)
SMTP_SECURE=false                # true for port 465 (SSL), false for 587 (STARTTLS)
SMTP_USER=your-email@example.com
SMTP_PWD=your-password

# Email Addresses
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com  # Optional, defaults to SUPPORT_EMAIL
NOREPLY_EMAIL_NAME=Rallly              # Optional, defaults to "Rallly"

# Security (optional)
SMTP_REJECT_UNAUTHORIZED=true    # Validate TLS certificates (default: true)
```

## Common SMTP Provider Configurations

### 1. Gmail / Google Workspace

**Note:** Gmail requires an "App Password" for SMTP. Enable 2FA and generate an app password.

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PWD=your-app-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=your-email@gmail.com
NOREPLY_EMAIL=noreply@gmail.com
```

**Alternative (SSL):**
```bash
SMTP_PORT=465
SMTP_SECURE=true
```

### 2. SendGrid

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PWD=your-sendgrid-api-key
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com
```

### 3. Mailgun

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PWD=your-mailgun-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com
```

### 4. AWS SES (via SMTP)

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Use your SES region
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PWD=your-ses-smtp-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com
```

**Note:** You can also use AWS SES directly by setting `EMAIL_PROVIDER=ses` and configuring AWS credentials.

### 5. Microsoft 365 / Outlook

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PWD=your-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=your-email@outlook.com
NOREPLY_EMAIL=noreply@outlook.com
```

### 6. Postmark

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-postmark-server-token
SMTP_PWD=your-postmark-server-token
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com
```

### 7. Custom SMTP Server

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PWD=your-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=support@yourdomain.com
NOREPLY_EMAIL=noreply@yourdomain.com
```

## Port and Security Settings

| Port | SMTP_SECURE | Description |
|------|-------------|-------------|
| 587  | `false`     | STARTTLS (recommended) |
| 465  | `true`      | SSL/TLS (direct) |
| 25   | `false`     | Plain (not recommended) |

## Testing Your SMTP Configuration

1. Update your `.env` file with your SMTP settings
2. Restart your development server: `pnpm dev`
3. Try sending a test email (e.g., user registration, password reset)
4. Check your email inbox for the test email

## Troubleshooting

### Certificate Validation Errors

If you're using a self-signed certificate (not recommended for production):
```bash
SMTP_REJECT_UNAUTHORIZED=false
```

### Connection Timeouts

- Verify your `SMTP_HOST` is correct
- Check firewall settings
- Ensure the port is not blocked
- Try different ports (587 vs 465)

### Authentication Failures

- Verify `SMTP_USER` and `SMTP_PWD` are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check if your provider requires IP whitelisting

### Development Testing

For local development, you can continue using Mailpit (already configured):
- Access Mailpit UI at: http://localhost:8025
- All emails will be captured there instead of being sent

## Security Best Practices

1. **Never commit `.env` files** to version control
2. Use **App Passwords** for Gmail/Google Workspace
3. Keep `SMTP_REJECT_UNAUTHORIZED=true` in production
4. Use **environment-specific** configurations
5. Rotate passwords regularly

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/smtp/)
- [Rallly Configuration Docs](https://support.rallly.co/self-hosting/configuration-options)

