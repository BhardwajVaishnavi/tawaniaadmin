import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLoyaltyProgram() {
  console.log('Seeding loyalty program data...');

  // Create a loyalty program
  const loyaltyProgram = await prisma.loyaltyProgram.create({
    data: {
      name: 'Tawania Rewards',
      description: 'Earn points on every purchase and redeem for discounts',
      pointsPerCurrency: 1, // 1 point per $1
      minimumPurchase: 10, // $10 minimum purchase to earn points
      isActive: true,
    },
  });

  console.log(`Created loyalty program: ${loyaltyProgram.name}`);

  // Create loyalty program tiers
  const tiers = await Promise.all([
    prisma.loyaltyProgramTier.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Standard',
        description: 'Standard tier for all customers',
        requiredPoints: 0,
        pointsMultiplier: 1,
        benefits: JSON.stringify(['Basic rewards']),
      },
    }),
    prisma.loyaltyProgramTier.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Silver',
        description: 'Silver tier for regular customers',
        requiredPoints: 1000,
        pointsMultiplier: 1.25,
        benefits: JSON.stringify(['10% bonus points', 'Birthday gift']),
      },
    }),
    prisma.loyaltyProgramTier.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Gold',
        description: 'Gold tier for loyal customers',
        requiredPoints: 5000,
        pointsMultiplier: 1.5,
        benefits: JSON.stringify(['25% bonus points', 'Birthday gift', 'Exclusive promotions']),
      },
    }),
    prisma.loyaltyProgramTier.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Platinum',
        description: 'Platinum tier for VIP customers',
        requiredPoints: 10000,
        pointsMultiplier: 2,
        benefits: JSON.stringify(['50% bonus points', 'Birthday gift', 'Exclusive promotions', 'Free shipping']),
      },
    }),
  ]);

  console.log(`Created ${tiers.length} loyalty tiers`);

  // Create loyalty program rules
  const rules = await Promise.all([
    prisma.loyaltyProgramRule.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Purchase Points',
        description: 'Earn points for every purchase',
        type: 'PURCHASE',
        pointsAwarded: 0, // Dynamic based on purchase amount
        isActive: true,
      },
    }),
    prisma.loyaltyProgramRule.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'First Purchase Bonus',
        description: 'Bonus points for first purchase',
        type: 'FIRST_PURCHASE',
        pointsAwarded: 100,
        isActive: true,
      },
    }),
    prisma.loyaltyProgramRule.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Birthday Bonus',
        description: 'Bonus points on your birthday',
        type: 'BIRTHDAY',
        pointsAwarded: 250,
        isActive: true,
      },
    }),
    prisma.loyaltyProgramRule.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Referral Bonus',
        description: 'Bonus points for referring a friend',
        type: 'REFERRAL',
        pointsAwarded: 500,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${rules.length} loyalty rules`);

  // Create promotions
  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const promotions = await Promise.all([
    prisma.customerPromotion.create({
      data: {
        name: 'Welcome Discount',
        description: '10% off your first purchase',
        type: 'DISCOUNT_PERCENTAGE',
        discountValue: 10,
        isPercentage: true,
        code: 'WELCOME10',
        minimumPurchase: 50,
        programId: loyaltyProgram.id,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
    prisma.customerPromotion.create({
      data: {
        name: 'Silver Member Discount',
        description: '15% off for Silver members',
        type: 'DISCOUNT_PERCENTAGE',
        discountValue: 15,
        isPercentage: true,
        requiredLoyaltyTier: 'SILVER',
        programId: loyaltyProgram.id,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
    prisma.customerPromotion.create({
      data: {
        name: 'Gold Member Discount',
        description: '20% off for Gold members',
        type: 'DISCOUNT_PERCENTAGE',
        discountValue: 20,
        isPercentage: true,
        requiredLoyaltyTier: 'GOLD',
        programId: loyaltyProgram.id,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
    prisma.customerPromotion.create({
      data: {
        name: 'Platinum Member Discount',
        description: '25% off for Platinum members',
        type: 'DISCOUNT_PERCENTAGE',
        discountValue: 25,
        isPercentage: true,
        requiredLoyaltyTier: 'PLATINUM',
        programId: loyaltyProgram.id,
        startDate: now,
        endDate: threeMonthsLater,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${promotions.length} promotions`);

  // Create customer groups
  const groups = await Promise.all([
    prisma.customerGroup.create({
      data: {
        name: 'Regular Customers',
        description: 'Customers who shop regularly',
      },
    }),
    prisma.customerGroup.create({
      data: {
        name: 'VIP Customers',
        description: 'High-value customers',
      },
    }),
    prisma.customerGroup.create({
      data: {
        name: 'Wholesale Customers',
        description: 'Customers who buy in bulk',
      },
    }),
  ]);

  console.log(`Created ${groups.length} customer groups`);

  console.log('Loyalty program data seeding completed');
}

export { seedLoyaltyProgram };
