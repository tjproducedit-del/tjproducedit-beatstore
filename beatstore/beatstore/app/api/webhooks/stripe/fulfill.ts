import { db } from "@/lib/db";
import { sendPurchaseEmail } from "@/lib/email";
import { generateLicensePdfBuffer } from "@/lib/license";

export async function fulfillOrder(orderId: string) {
  // Get the order with items and beat info
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { beat: true },
      },
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "COMPLETED") return; // Already fulfilled

  // Mark as completed
  await db.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED" },
  });

  // Mark exclusive beats as sold
  for (const item of order.items) {
    if (item.licenseType === "EXCLUSIVE") {
      await db.beat.update({
        where: { id: item.beatId },
        data: { isSold: true },
      });
    }
  }

  // Generate license PDF for the first item (could generate per-item in production)
  const firstItem = order.items[0];
  const licensePdf = generateLicensePdfBuffer({
    customerName: order.customerName || "Customer",
    customerEmail: order.email,
    beatTitle: firstItem.beat.title,
    licenseType: firstItem.licenseType,
    orderId: order.id,
    date: new Date().toISOString().split("T")[0],
    producerName: "TjProducedIt",
  });

  // Send download email
  await sendPurchaseEmail({
    to: order.email,
    customerName: order.customerName || "there",
    downloadToken: order.downloadToken,
    orderItems: order.items.map((item) => ({
      title: item.beat.title,
      licenseType: item.licenseType,
      price: item.price,
    })),
    total: order.total,
    licensePdfBuffer: licensePdf,
  });
}
