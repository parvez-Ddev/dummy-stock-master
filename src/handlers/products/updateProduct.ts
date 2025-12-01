import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";
import { z } from "zod";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const BodySchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
});

export const handler = async (event: any) => {
  try {
    const id = event.pathParameters.id;
    const data = BodySchema.parse(JSON.parse(event.body));
    const expr: string[] = [];
    const attrNames: Record<string, string> = {};
    const attrValues: Record<string, any> = {};

    let idx = 0;
    for (const [k, v] of Object.entries(data)) {
      idx++;
      const nameKey = `#k${idx}`;
      const valKey = `:v${idx}`;
      expr.push(`${nameKey} = ${valKey}`);
      attrNames[nameKey] = k;
      attrValues[valKey] = v;
    }
    // always update updatedAt
    idx++;
    const nameKey = `#k${idx}`;
    const valKey = `:v${idx}`;
    expr.push(`${nameKey} = ${valKey}`);
    attrNames[nameKey] = "updatedAt";
    attrValues[valKey] = new Date().toISOString();

    await db.send(
      new UpdateCommand({
        TableName: process.env.PRODUCTS_TABLE!,
        Key: { productId: id },
        UpdateExpression: "SET " + expr.join(", "),
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues,
      })
    );

    return success({ message: "Updated" });
  } catch (err: any) {
    if (err?.issues) return error(err.message, 400);
    return error(err.message || "Internal error");
  }
};
