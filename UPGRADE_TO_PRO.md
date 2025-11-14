# Upgrade Account to Pro for Testing

This guide shows you how to manually upgrade your account to Pro tier so you can test the Finalize feature and reminders.

## Quick Method (SQL)

1. **Find your email address** - Check what email you used to sign up

2. **Run the SQL script** with your email:
   ```bash
   # First, edit the script to replace 'your-email@example.com' with your actual email
   # Or run this command directly:
   
   docker exec rallly-rallly_db-1 psql -U postgres -d rallly -c "
   DO \$\$
   DECLARE
       v_user_id TEXT;
       v_space_id TEXT;
       v_subscription_id TEXT;
   BEGIN
       SELECT id INTO v_user_id FROM users WHERE email = 'crazyazndriver25@yahoo.com';
       
       IF v_user_id IS NULL THEN
           RAISE EXCEPTION 'User not found';
       END IF;
       
       SELECT id INTO v_space_id FROM spaces WHERE owner_id = v_user_id LIMIT 1;
       
       IF v_space_id IS NULL THEN
           INSERT INTO spaces (id, name, owner_id, created_at, updated_at)
           VALUES (gen_random_uuid()::TEXT, 'Personal', v_user_id, NOW(), NOW())
           RETURNING id INTO v_space_id;
           
           INSERT INTO space_members (id, space_id, user_id, role, created_at, updated_at, last_selected_at)
           VALUES (gen_random_uuid()::TEXT, v_space_id, v_user_id, 'ADMIN', NOW(), NOW(), NOW());
       END IF;
       
       SELECT id INTO v_subscription_id FROM subscriptions WHERE space_id = v_space_id;
       
       IF v_subscription_id IS NOT NULL THEN
           UPDATE subscriptions SET active = true, status = 'active', period_end = NOW() + INTERVAL '1 year' WHERE id = v_subscription_id;
       ELSE
           v_subscription_id := 'test_sub_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
           INSERT INTO subscriptions (id, user_id, space_id, price_id, subscription_item_id, amount, currency, interval, quantity, active, status, period_start, period_end, cancel_at_period_end, created_at)
           VALUES (v_subscription_id, v_user_id, v_space_id, 'test_price_id', 'test_item_' || EXTRACT(EPOCH FROM NOW())::BIGINT, 0, 'usd', 'month', 1, true, 'active', NOW(), NOW() + INTERVAL '1 year', false, NOW());
       END IF;
   END \$\$;
   "
   ```

   **Replace `YOUR-EMAIL@EXAMPLE.COM` with your actual email address!**

3. **Refresh your browser** - The Pro features should now be available

## Alternative: Using the TypeScript Script

If you have `tsx` installed:

```bash
pnpm tsx scripts/upgrade-to-pro.ts your-email@example.com
```

## Verify Upgrade

After running the script, you can verify it worked:

```bash
# Check your subscription
docker exec rallly-rallly_db-1 psql -U postgres -d rallly -c "
SELECT u.email, s.name as space_name, sub.active, sub.status 
FROM users u 
JOIN spaces s ON s.owner_id = u.id 
LEFT JOIN subscriptions sub ON sub.space_id = s.id 
WHERE u.email = 'YOUR-EMAIL@EXAMPLE.COM';
"
```

You should see `active = true` and `status = 'active'`.

## What This Does

- Creates a space for your user (if you don't have one)
- Creates or activates a subscription for your space
- Sets the subscription to "active" status
- Makes your space tier "pro" instead of "hobby"

After this, you'll be able to:
- ✅ Finalize polls
- ✅ Duplicate polls  
- ✅ Use all Pro features

## Reverting

To remove Pro access (revert to hobby tier):

```bash
docker exec rallly-rallly_db-1 psql -U postgres -d rallly -c "
UPDATE subscriptions 
SET active = false, status = 'canceled' 
WHERE space_id IN (
    SELECT id FROM spaces WHERE owner_id = (
        SELECT id FROM users WHERE email = 'YOUR-EMAIL@EXAMPLE.COM'
    )
);
"
```

