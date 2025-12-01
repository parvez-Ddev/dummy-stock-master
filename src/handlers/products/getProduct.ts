import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";

const TABLE = process.env.PRODUCTS_TABLE!;

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters.id;

    const result = await db.send(
      new GetCommand({
        TableName: TABLE,
        Key: { productId },
      })
    );

    return success(result.Item || {});
  } catch (err) {
    console.error(err);
    return error("Failed to get product");
  }
};
