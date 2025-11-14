-- Script to manually upgrade a user's space to Pro tier
-- 
-- Usage:
--   1. Find your user email from the app
--   2. Run this SQL script, replacing 'your-email@example.com' with your actual email
--
-- Example:
--   docker exec rallly-rallly_db-1 psql -U postgres -d rallly -f scripts/upgrade-to-pro.sql
--   Then manually update the email in the script below

-- Step 1: Find your user and space IDs
-- Replace 'your-email@example.com' with your actual email
DO $$
DECLARE
    v_user_id TEXT;
    v_space_id TEXT;
    v_subscription_id TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'your-email@example.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found. Please check your email address.';
    END IF;
    
    -- Get or create space
    SELECT id INTO v_space_id FROM spaces WHERE owner_id = v_user_id LIMIT 1;
    
    IF v_space_id IS NULL THEN
        -- Create a default space
        INSERT INTO spaces (id, name, owner_id, created_at, updated_at)
        VALUES (
            gen_random_uuid()::TEXT,
            'Personal',
            v_user_id,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_space_id;
        
        -- Add user as space member
        INSERT INTO space_members (id, space_id, user_id, role, created_at, updated_at, last_selected_at)
        VALUES (
            gen_random_uuid()::TEXT,
            v_space_id,
            v_user_id,
            'ADMIN',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created space: %', v_space_id;
    END IF;
    
    -- Check if subscription exists
    SELECT id INTO v_subscription_id FROM subscriptions WHERE space_id = v_space_id;
    
    IF v_subscription_id IS NOT NULL THEN
        -- Update existing subscription to active
        UPDATE subscriptions
        SET 
            active = true,
            status = 'active',
            period_end = NOW() + INTERVAL '1 year'
        WHERE id = v_subscription_id;
        
        RAISE NOTICE 'Updated existing subscription: %', v_subscription_id;
    ELSE
        -- Create new subscription
        v_subscription_id := 'test_sub_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
        
        INSERT INTO subscriptions (
            id,
            user_id,
            space_id,
            price_id,
            subscription_item_id,
            amount,
            currency,
            interval,
            quantity,
            active,
            status,
            period_start,
            period_end,
            cancel_at_period_end,
            created_at
        )
        VALUES (
            v_subscription_id,
            v_user_id,
            v_space_id,
            'test_price_id',
            'test_item_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            0,
            'usd',
            'month',
            1,
            true,
            'active',
            NOW(),
            NOW() + INTERVAL '1 year',
            false,
            NOW()
        );
        
        RAISE NOTICE 'Created subscription: %', v_subscription_id;
    END IF;
    
    RAISE NOTICE '✅ Upgrade complete! User % now has Pro access.', v_user_id;
END $$;

