"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamo_1 = require("../../utils/dynamo");
const responses_1 = require("../../utils/responses");
const zod_1 = require("zod");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const BodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    sku: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().optional(),
    unit: zod_1.z.string().optional(),
});
const handler = async (event) => {
    try {
        const id = event.pathParameters.id;
        const data = BodySchema.parse(JSON.parse(event.body));
        const expr = [];
        const attrNames = {};
        const attrValues = {};
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
        await dynamo_1.db.send(new lib_dynamodb_1.UpdateCommand({
            TableName: process.env.PRODUCTS_TABLE,
            Key: { productId: id },
            UpdateExpression: "SET " + expr.join(", "),
            ExpressionAttributeNames: attrNames,
            ExpressionAttributeValues: attrValues,
        }));
        return (0, responses_1.success)({ message: "Updated" });
    }
    catch (err) {
        if (err?.issues)
            return (0, responses_1.error)(err.message, 400);
        return (0, responses_1.error)(err.message || "Internal error");
    }
};
exports.handler = handler;
//# sourceMappingURL=updateProduct.js.map