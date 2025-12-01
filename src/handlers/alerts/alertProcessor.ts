export const handler = async (event: any) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const detail = message.detail;

      console.log("🔔 Low Stock Alert Received", {
        productId: detail.productId,
        name: detail.name,
        quantity: detail.quantity,
      });

      // Future: send SNS/email/slack
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error("Alert Processor Error", err);
    throw err;
  }
};
