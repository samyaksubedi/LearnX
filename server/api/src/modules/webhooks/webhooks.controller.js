const updateConversationStatus = async (req, res, next) => {
  try {
    // enum status =   processing | ready | failed
    const { status, conversationId, error } 
  } catch (error) {
    next(error);
  }
};

export { updateConversationStatus };


// // Python sends header
// headers: { "x-webhook-secret": process.env.WEBHOOK_SECRET }

// // Node verifies
// if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
//     return res.status(401).json({ error: "Unauthorized" })
// }
