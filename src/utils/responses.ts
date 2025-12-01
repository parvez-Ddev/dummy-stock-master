export const success = (body: any, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(body),
});

export const error = (message: any, statusCode = 500) => ({
  statusCode,
  body: JSON.stringify({ error: message }),
});
