"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../../utils/dynamo");
const responses_1 = require("../../utils/responses");
const TABLE = process.env.PRODUCTS_TABLE;
const handler = async (event) => {
    try {
        const productId = event.pathParameters.id;
        await dynamo_1.db.send(new lib_dynamodb_1.DeleteCommand({
            TableName: TABLE,
            Key: { productId },
        }));
        return (0, responses_1.success)({ message: "Product deleted" });
    }
    catch (err) {
        console.error(err);
        return (0, responses_1.error)("Failed to delete product");
    }
};
exports.handler = handler;
//# sourceMappingURL=deleteProduct.js.map