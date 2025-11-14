#!/usr/bin/env tsx
/**
 * Script to manually upgrade a user's space to Pro tier for testing
 *
 * Usage:
 *   pnpm tsx scripts/upgrade-to-pro.ts <user-email>
 *
 * Example:
 *   pnpm tsx scripts/upgrade-to-pro.ts your-email@example.com
 */

import { prisma } from "@rallly/database";

async function upgradeToPro(userEmail: string) {
  console.log(`Upgrading user ${userEmail} to Pro tier...`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      spaces: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`User with email ${userEmail} not found`);
    process.exit(1);
  }

  if (user.spaces.length === 0) {
    console.error(
      `User ${userEmail} has no spaces. Creating a default space...`
    );

    // Create a default space for the user
    const space = await prisma.space.create({
      data: {
        name: `${user.name}'s Space`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
      },
    });

    console.log(`Created space: ${space.id} (${space.name})`);

    // Create subscription for the new space
    await createSubscription(space.id, user.id);
  } else {
    // Upgrade the first space (or all spaces)
    for (const space of user.spaces) {
      if (space.subscription?.active) {
        console.log(
          `Space ${space.name} (${space.id}) already has an active subscription`
        );
        continue;
      }

      await createSubscription(space.id, user.id);
      console.log(`✓ Upgraded space: ${space.name} (${space.id})`);
    }
  }

  console.log("\n✅ Upgrade complete! You can now use Pro features.");
}

async function createSubscription(spaceId: string, userId: string) {
  // Check if subscription already exists
  const existing = await prisma.subscription.findUnique({
    where: { spaceId },
  });

  if (existing) {
    // Update existing subscription to active
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        active: true,
        status: "active",
        periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
    console.log(`  Updated existing subscription ${existing.id}`);
  } else {
    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        id: `test_sub_${Date.now()}`,
        userId,
        spaceId,
        priceId: "test_price_id",
        subscriptionItemId: `test_item_${Date.now()}`,
        amount: 0, // Free for testing
        currency: "usd",
        interval: "month",
        quantity: 1,
        active: true,
        status: "active",
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        cancelAtPeriodEnd: false,
      },
    });
    console.log(`  Created subscription ${subscription.id}`);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Usage: pnpm tsx scripts/upgrade-to-pro.ts <user-email>");
  console.error(
    "Example: pnpm tsx scripts/upgrade-to-pro.ts your-email@example.com"
  );
  process.exit(1);
}

upgradeToPro(userEmail)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
