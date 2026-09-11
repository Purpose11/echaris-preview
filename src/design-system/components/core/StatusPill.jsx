import React from 'react';
import { Badge } from './Badge.jsx';

/* Canonical Echaris record statuses → tone + label. Labels are sentence case
   and follow the approved brand vocabulary (never "investment"/"ROI"). */
export const STATUS_MAP = {
  active: ['success', 'Active'],
  completed: ['success', 'Completed'],
  verified: ['success', 'Verified'],
  paid: ['success', 'Paid'],
  delivered: ['success', 'Delivered'],
  pending: ['warning', 'Pending'],
  processing: ['warning', 'Processing'],
  awaiting_payment: ['warning', 'Awaiting payment'],
  unverified: ['warning', 'Unverified'],
  in_review: ['info', 'In review'],
  shipped: ['info', 'Shipped'],
  scheduled: ['info', 'Scheduled'],
  matured: ['brand', 'Matured'],
  funding: ['brand', 'Funding'],
  failed: ['danger', 'Failed'],
  declined: ['danger', 'Declined'],
  rejected: ['danger', 'Rejected'],
  cancelled: ['neutral', 'Cancelled'],
  draft: ['neutral', 'Draft'],
  closed: ['neutral', 'Closed'],
};

export function StatusPill({ status, label, size = 'md', ...rest }) {
  const [tone, text] = STATUS_MAP[status] || ['neutral', status];
  return <Badge tone={tone} size={size} dot {...rest}>{label || text}</Badge>;
}
