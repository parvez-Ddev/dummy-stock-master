import { GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";
import { Movement } from "../../models/Movement";
import { v4 as uuid } from "uuid";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const MOVEMENTS_TABLE = process.env.MOVEMENTS_TABLE!;

export const handler = async (event: any) => {
  const eventBridge = new EventBridgeClient({});
  try {
    const data = JSON.parse(event.body);

    // 1️⃣ Fetch product
    const productResp = await db.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { productId: data.productId },
      })
    );

    const product = productResp.Item;

    if (!product) {
      return error("Product not found", 404);
    }

    // 2️⃣ Calculate new quantity
    let updatedQuantity = product.quantity;

    if (data.type === "IN") {
      updatedQuantity += data.quantity;
    } else if (data.type === "OUT") {
      updatedQuantity -= data.quantity;
    }

    if (updatedQuantity < 0) {
      return error("Insufficient stock", 400);
    }

    // 3️⃣ Update product quantity
    await db.send(
      new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { productId: data.productId },
        UpdateExpression: "set quantity = :q, updatedAt = :u",
        ExpressionAttributeValues: {
          ":q": updatedQuantity,
          ":u": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    // 4️⃣ Save movement
    const movement: Movement = {
      movementId: uuid(),
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      timestamp: new Date().toISOString(),
      notes: data.notes,
    };

    await db.send(
      new PutCommand({
        TableName: MOVEMENTS_TABLE,
        Item: movement,
      })
    );

    // 5️⃣ Send EventBridge alert
    await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: "stockmaster.products",
            DetailType: "LowStockCheck",
            Detail: JSON.stringify({
              productId: product.productId,
              name: product.name,
              quantity: updatedQuantity,
            }),
          },
        ],
      })
    );

    return success(movement, 201);
  } catch (err) {
    console.error(err);
    return error("Failed to create movement");
  }
};
