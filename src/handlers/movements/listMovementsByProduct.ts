import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../utils/dynamo";
import { success, error } from "../../utils/responses";

const MOVEMENTS_TABLE = process.env.MOVEMENTS_TABLE!;

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters.id;

    const result = await db.send(
      new QueryCommand({
        TableName: MOVEMENTS_TABLE,
        KeyConditionExpression: "productId = :p",
        ExpressionAttributeValues: { ":p": productId },
      })
    );

    return success(result.Items || []);
  } catch (err) {
    console.error(err);
    return error("Failed to get movements");
  }
};
