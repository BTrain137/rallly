# Testing Your Gmail SMTP Configuration

## Quick Test Steps

### Option 1: Test via User Registration (Recommended)

1. **Restart your development server** to load the new SMTP settings:
   ```bash
   # Stop the current server (Ctrl+C if running), then:
   pnpm dev
   ```

2. **Open Rallly in your browser**: http://localhost:3000

3. **Register a new user**:
   - Click "Sign Up" or navigate to the registration page
   - Enter a name and email address (use a different email than your Gmail account to test)
   - Complete the registration process
   - You should receive a verification email with a code

4. **Check your Gmail inbox** for the email

### Option 2: Test via Password Reset

1. **Restart your development server**:
   ```bash
   pnpm dev
   ```

2. **Go to the login page**: http://localhost:3000/login

3. **Click "Forgot Password"**

4. **Enter your email address** and submit

5. **Check your Gmail inbox** for the password reset email

## What to Look For

### ✅ Success Indicators:
- No errors in the server console
- Email appears in your Gmail inbox within a few seconds
- Email is from: `Rallly <crazyazndriver@gmail.com>` (or your NOREPLY_EMAIL_NAME)
- Email contains the expected content (verification code, reset link, etc.)

### ❌ Common Issues:

**"Invalid login" or "Authentication failed"**
- Double-check your App Password (no spaces, 16 characters)
- Verify 2-Step Verification is enabled
- Make sure you're using the App Password, not your regular Gmail password

**"Connection timeout"**
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try port 465 with `SMTP_SECURE=true`

**Email not received**
- Check spam/junk folder
- Wait a minute (sometimes there's a slight delay)
- Check server console for error messages

## Checking Server Logs

Watch your terminal where `pnpm dev` is running. You should see:
- No SMTP connection errors
- Email sending confirmation (if logging is enabled)

If you see errors, they'll help diagnose the issue.

## Next Steps

Once emails are working:
- ✅ Your SMTP configuration is complete!
- You can now use Rallly with real email functionality
- Consider setting up a dedicated "noreply" email address for production

