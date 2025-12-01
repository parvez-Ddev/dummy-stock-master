"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../../utils/dynamo");
const responses_1 = require("../../utils/responses");
const uuid_1 = require("uuid");
const client_eventbridge_1 = require("@aws-sdk/client-eventbridge");
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const MOVEMENTS_TABLE = process.env.MOVEMENTS_TABLE;
const handler = async (event) => {
    const eventBridge = new client_eventbridge_1.EventBridgeClient({});
    try {
        const data = JSON.parse(event.body);
        // 1️⃣ Fetch product
        const productResp = await dynamo_1.db.send(new lib_dynamodb_1.GetCommand({
            TableName: PRODUCTS_TABLE,
            Key: { productId: data.productId },
        }));
        const product = productResp.Item;
        if (!product) {
            return (0, responses_1.error)("Product not found", 404);
        }
        // 2️⃣ Calculate new quantity
        let updatedQuantity = product.quantity;
        if (data.type === "IN") {
            updatedQuantity += data.quantity;
        }
        else if (data.type === "OUT") {
            updatedQuantity -= data.quantity;
        }
        if (updatedQuantity < 0) {
            return (0, responses_1.error)("Insufficient stock", 400);
        }
        // 3️⃣ Update product quantity
        await dynamo_1.db.send(new lib_dynamodb_1.UpdateCommand({
            TableName: PRODUCTS_TABLE,
            Key: { productId: data.productId },
            UpdateExpression: "set quantity = :q, updatedAt = :u",
            ExpressionAttributeValues: {
                ":q": updatedQuantity,
                ":u": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
        }));
        // 4️⃣ Save movement
        const movement = {
            movementId: (0, uuid_1.v4)(),
            productId: data.productId,
            type: data.type,
            quantity: data.quantity,
            timestamp: new Date().toISOString(),
            notes: data.notes,
        };
        await dynamo_1.db.send(new lib_dynamodb_1.PutCommand({
            TableName: MOVEMENTS_TABLE,
            Item: movement,
        }));
        // 5️⃣ Send EventBridge alert
        await eventBridge.send(new client_eventbridge_1.PutEventsCommand({
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
        }));
        return (0, responses_1.success)(movement, 201);
    }
    catch (err) {
        console.error(err);
        return (0, responses_1.error)("Failed to create movement");
    }
};
exports.handler = handler;
//# sourceMappingURL=createMovement.js.map