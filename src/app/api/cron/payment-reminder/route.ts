import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { emitWebhook } from "@/server/services/webhooks";

export async function GET() {
  const targetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const subs = await db.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      },
    },
    include: {
      user: { select: { name: true, whatsapp: true } },
      plan: { select: { name: true } },
    },
  });

  for (const s of subs) {
    await emitWebhook("payment.reminder", {
      user: { name: s.user.name, whatsapp: s.user.whatsapp },
      plan: { name: s.plan.name },
      endDate: s.endDate?.toISOString(),
      daysBefore: 3,
    });
  }

  return NextResponse.json({ count: subs.length });
}