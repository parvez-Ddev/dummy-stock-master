import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";

const TABLE = process.env.PRODUCTS_TABLE!;

export const handler = async () => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE,
      })
    );

    return success(result.Items || []);
  } catch (err) {
    console.error(err);
    return error("Failed to list products");
  }
};
