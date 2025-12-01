"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../../utils/dynamo");
const responses_1 = require("../../utils/responses");
const uuid_1 = require("uuid");
const TABLE = process.env.PRODUCTS_TABLE;
const handler = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const now = new Date().toISOString();
        const item = {
            productId: (0, uuid_1.v4)(),
            name: data.name,
            description: data.description,
            quantity: data.quantity ?? 0,
            createdAt: now,
            updatedAt: now,
        };
        await dynamo_1.db.send(new lib_dynamodb_1.PutCommand({
            TableName: TABLE,
            Item: item,
        }));
        return (0, responses_1.success)(item, 201);
    }
    catch (err) {
        console.error(err);
        return (0, responses_1.error)("Failed to create product");
    }
};
exports.handler = handler;
//# sourceMappingURL=createProduct.js.map