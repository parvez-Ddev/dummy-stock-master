"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../../utils/dynamo");
const responses_1 = require("../../utils/responses");
const MOVEMENTS_TABLE = process.env.MOVEMENTS_TABLE;
const handler = async (event) => {
    try {
        const productId = event.pathParameters.id;
        const result = await dynamo_1.db.send(new lib_dynamodb_1.QueryCommand({
            TableName: MOVEMENTS_TABLE,
            KeyConditionExpression: "productId = :p",
            ExpressionAttributeValues: { ":p": productId },
        }));
        return (0, responses_1.success)(result.Items || []);
    }
    catch (err) {
        console.error(err);
        return (0, responses_1.error)("Failed to get movements");
    }
};
exports.handler = handler;
//# sourceMappingURL=listMovementsByProduct.js.map