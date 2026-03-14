export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function sendError(res, message, details, statusCode = 400) {
  if (typeof details === 'number' && statusCode === 400) {
    return res.status(details).json({
      success: false,
      message
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}
