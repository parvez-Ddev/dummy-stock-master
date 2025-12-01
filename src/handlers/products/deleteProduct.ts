import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";

const TABLE = process.env.PRODUCTS_TABLE!;

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters.id;

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { productId },
      })
    );

    return success({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return error("Failed to delete product");
  }
};
