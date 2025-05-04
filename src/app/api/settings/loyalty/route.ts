import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can update loyalty settings." },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const {
      pointsPerDollar,
      pointsRedemptionRate,
      minimumPointsRedemption,
      welcomeBonus,
      birthdayBonus,
      referralBonus,
    } = body;
    
    // Validate required fields
    if (
      pointsPerDollar === undefined ||
      pointsRedemptionRate === undefined ||
      minimumPointsRedemption === undefined ||
      welcomeBonus === undefined ||
      birthdayBonus === undefined ||
      referralBonus === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Update settings in a transaction
    await prisma.$transaction([
      prisma.setting.upsert({
        where: { key: 'loyalty_points_per_dollar' },
        update: { value: pointsPerDollar.toString() },
        create: { key: 'loyalty_points_per_dollar', value: pointsPerDollar.toString() },
      }),
      prisma.setting.upsert({
        where: { key: 'loyalty_redemption_rate' },
        update: { value: pointsRedemptionRate.toString() },
        create: { key: 'loyalty_redemption_rate', value: pointsRedemptionRate.toString() },
      }),
      prisma.setting.upsert({
        where: { key: 'loyalty_minimum_redemption' },
        update: { value: minimumPointsRedemption.toString() },
        create: { key: 'loyalty_minimum_redemption', value: minimumPointsRedemption.toString() },
      }),
      prisma.setting.upsert({
        where: { key: 'loyalty_welcome_bonus' },
        update: { value: welcomeBonus.toString() },
        create: { key: 'loyalty_welcome_bonus', value: welcomeBonus.toString() },
      }),
      prisma.setting.upsert({
        where: { key: 'loyalty_birthday_bonus' },
        update: { value: birthdayBonus.toString() },
        create: { key: 'loyalty_birthday_bonus', value: birthdayBonus.toString() },
      }),
      prisma.setting.upsert({
        where: { key: 'loyalty_referral_bonus' },
        update: { value: referralBonus.toString() },
        create: { key: 'loyalty_referral_bonus', value: referralBonus.toString() },
      }),
    ]);
    
    return NextResponse.json({
      message: "Loyalty settings updated successfully",
      settings: {
        pointsPerDollar,
        pointsRedemptionRate,
        minimumPointsRedemption,
        welcomeBonus,
        birthdayBonus,
        referralBonus,
      },
    });
  } catch (error) {
    console.error("Error updating loyalty settings:", error);
    return NextResponse.json(
      { message: "Failed to update loyalty settings", error: (error as Error).message },
      { status: 500 }
    );
  }
}
