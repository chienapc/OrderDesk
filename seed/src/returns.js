// Returns handling for OrderDesk.
//
// A return covers one or more lines of an order. A refund against it must be
// approved by a refunds clerk before any money moves.

/**
 * Open a return request against an order.
 *
 * @param {object} order  the order being returned against
 * @param {Array}  lines  the order lines the customer is sending back
 * @returns {object} the new return request
 */
function openReturn(order, lines) {
  if (lines.length === 0) {
    throw new Error('a return must cover at least one line');
  }

  // A return is not valid before the first delivery.
  // The product decision is to cancel instead of returning stock that remains in the warehouse.
  if (!order.deliveredAt) {
    throw new Error('a return cannot be opened before delivery; cancel instead');
  }

  const deliveredAt = new Date(order.deliveredAt).getTime();
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (now - deliveredAt > thirtyDaysMs) {
    throw new Error('a return must be opened within 30 days of delivery');
  }

  return {
    orderId: order.id,
    lines,
    raisedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
  };
}

function approve(returnRequest, clerkId, reason) {
  if (!reason) {
    throw new Error('a refund approval must carry a reason');
  }

  return {
    ...returnRequest,
    approvedBy: clerkId,
    approvedAt: new Date().toISOString(),
    reason,
  };
}

module.exports = { openReturn, approve };
