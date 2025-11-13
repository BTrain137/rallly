# Gmail SMTP Setup Guide for Rallly

## Step-by-Step Instructions

### Step 1: Enable 2-Factor Authentication (Required)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable 2FA
   - You'll need to verify your phone number
   - Google will send you a verification code

**Note:** App Passwords are only available if 2-Step Verification is enabled.

### Step 2: Generate an App Password

1. Go directly to App Passwords: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords

2. You may be asked to sign in again for security

3. Under "Select app", choose **Mail**

4. Under "Select device", choose **Other (Custom name)**

5. Type a name like: **Rallly SMTP** or **Rallly Email**

6. Click **Generate**

7. Google will show you a **16-character password** (with spaces, like: `abcd efgh ijkl mnop`)
   - **Copy this password immediately** - you won't be able to see it again!
   - Remove the spaces when using it (it should be: `abcdefghijklmnop`)

### Step 3: Update Your .env File

Update your `.env` file with these settings:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PWD=your-16-character-app-password
SMTP_REJECT_UNAUTHORIZED=true
SUPPORT_EMAIL=your-email@gmail.com
NOREPLY_EMAIL=your-email@gmail.com
NOREPLY_EMAIL_NAME=Rallly
```

**Important:**
- Use your **full Gmail address** for `SMTP_USER`
- Use the **16-character App Password** (without spaces) for `SMTP_PWD`
- Do NOT use your regular Gmail password

### Step 4: Test Your Configuration

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Try triggering an email (e.g., user registration, password reset)

3. Check your Gmail inbox for the test email

## Troubleshooting

### "Invalid login" or "Authentication failed"

- Make sure you're using the **App Password**, not your regular Gmail password
- Verify the App Password doesn't have spaces
- Ensure 2-Step Verification is enabled

### "Less secure app access" error

- This shouldn't happen with App Passwords
- If you see this, make sure you're using an App Password, not your regular password

### Can't find App Passwords option

- Make sure 2-Step Verification is enabled first
- Try accessing directly: https://myaccount.google.com/apppasswords
- Some Google Workspace accounts may have this disabled by admin

### Workspace/Organization Account

If you're using Google Workspace (not personal Gmail):
- Your admin may need to enable "Less secure app access" or allow App Passwords
- Contact your Google Workspace administrator if App Passwords aren't available

## Alternative: Using OAuth2 (Advanced)

For production, you might want to use OAuth2 instead of App Passwords. This requires additional setup but is more secure. Let me know if you'd like help with that!

## Security Notes

- App Passwords are specific to the app/device you create them for
- You can revoke App Passwords at any time from the same page
- Each App Password can only be used for one purpose
- Never share your App Password or commit it to version control

