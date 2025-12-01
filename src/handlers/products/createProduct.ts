import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";
import { Product } from "../../models/Product";
import { v4 as uuid } from "uuid";

const TABLE = process.env.PRODUCTS_TABLE!;

export const handler = async (event: any) => {
  try {
    const data = JSON.parse(event.body);
    const now = new Date().toISOString();

    const item: Product = {
      productId: uuid(),
      name: data.name,
      description: data.description,
      quantity: data.quantity ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
      })
    );

    return success(item, 201);
  } catch (err) {
    console.error(err);
    return error("Failed to create product");
  }
};
