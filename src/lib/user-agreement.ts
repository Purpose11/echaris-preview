export const USER_AGREEMENT_TITLE = "User Agreement: Terms and Conditions of Service";

export const USER_AGREEMENT_INTRO = `Welcome to Echaris Trading Limited ("the Company", "we", "us", or "our"). This User Agreement governs your access to and use of our web platform, including our Shopping Wallet system, capital layout structures, and direct retail catalog. By creating an account, depositing capital, or placing an order, you agree to be bound by these Terms and Conditions.`;

export type AgreementSection = {
  heading: string;
  paragraphs: string[];
};

export const USER_AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    heading: "1. Account Onboarding & Identity Verification (KYC)",
    paragraphs: [
      "To access our asset layaway engine or commit capital, users must complete a compulsory Know Your Customer (KYC) verification workflow. You agree to provide accurate, current, and authentic personal information, including valid government-issued identification, proof of address, and verifiable contact credentials. The Company reserves the unilateral right to freeze, restrict, or terminate any account that fails verification checks or exhibits suspicious behavior.",
    ],
  },
  {
    heading: "2. Capital Commitment, Trade Yields & Mutual Risk/Loss Sharing",
    paragraphs: [
      "2.1 Fixed Capital Tenure: Users may choose to actively commit a specific principal capital pool to our hybrid procurement and commercial trading engine for a rigid, unalterable duration of exactly three (3) months. Once capital is committed and deployed into our active trades (including physical real estate acquisitions and hedged digital asset positions), it is locked within the trading engine for the full 3-month tenure and cannot be recalled early by the user.",
      "2.2 Targeted 10% Monthly Returns: The deployment of committed capital is engineered to generate a targeted internal trade surplus of ten percent (10%) monthly. These distributions are calculated at the end of each 30-day operating cycle and credited natively to the user's platform balance, where they can be withdrawn or seamlessly routed toward active e-commerce product layout orders.",
      "2.3 Mutual Loss and Risk-Sharing Clause: By committing capital to the platform, you explicitly acknowledge that all commercial trading, digital asset markets, and physical property procurement carry inherent, non-eliminable macroeconomic risks. To preserve the long-term stability and solvency of the trading engine, Echaris Trading Limited operates on a fractional mutual risk-sharing architecture. In the unprecedented event that a severe, catastrophic market downturn, liquidity crisis, or systemic asset depreciation occurs during your 3-month cycle, any net losses sustained by the trading engine will be distributed proportionally across all active committed capital pools. Under such extraordinary circumstances, the 10% monthly payout may be adjusted downward, or a maximum cap of up to 15% of the user's committed principal may be withheld to absorb the joint operational loss. The Company will provide auditable financial summaries to affected users should this mutual risk clause be triggered.",
      "IMPORTANT COMPLIANCE DISCLOSURE: The inclusion of Section 2.3 explicitly establishes a mutual risk-and-loss sharing commercial partnership. This structural parameter proves to payment networks and auditors that our engine operates as an asset-backed commercial trading collective rather than an unhedged, fixed-guarantee banking house or an illegal public deposit-taking enterprise.",
    ],
  },
  {
    heading: "3. Direct E-Commerce Procurement & The 50% Milestone Dispatch Rule",
    paragraphs: [
      "3.1 First-Party Verified Catalog: Echaris Trading Limited functions as a direct-to-consumer (D2C) retailer. We own, verify, and stock our independent physical warehouses with elite solar kits, backup heavy-duty generators, laptops, and energy-efficient appliances. We do not support third-party vendors or external merchant brokers, ensuring zero third-party counterparty risk for our retail buyers.",
      "3.2 The 50% Early Shipping Trigger: To make premium household assets highly affordable, users can link their shopping wallets directly to an active pre-order layout plan. Physical product delivery is triggered automatically the exact moment the cumulative deposits and running trade yields hit fifty percent (50%) of the total product retail price. Upon hitting this 50% threshold, our fulfillment hubs will immediately package and ship the physical asset to the client's verified address. The client retains full utility of the item while the remaining 50% retail balance is settled iteratively via their running platform returns.",
    ],
  },
  {
    heading: "4. Personal Shopping Wallet Security & P2P Deactivation",
    paragraphs: [
      "Every customer profile includes an insulated digital Shopping Wallet engineered solely to hold layout capital or accumulate product purchase credits. To prevent systemic compliance infractions and strictly comply with international anti-money laundering guidelines, all Peer-to-Peer (P2P) user-to-user balances and external transfer scripts are completely deactivated on our architecture. Funds residing within your internal shopping wallet cannot be bartered, assigned, or transferred to any other internal platform user; they are securely earmarked exclusively for your independent inventory purchase transactions.",
    ],
  },
  {
    heading: "5. Plan Cancellations, Refunds, and 7-Day Warranty Swaps",
    paragraphs: [
      "5.1 Pre-Delivery Cancellation: If a user elects to terminate an active product layout configuration prior to the 50% milestone shipping trigger, the accumulated wallet balance will be audited by our internal Finance team. Validated refunds will be processed and returned entirely to the customer's original funding source (original bank card or account) within 7 to 14 business days, subject to standard administrative merchant processing timelines.",
      "5.2 Post-Delivery 7-Day Replacement Swap: All physical goods dispatched from our hubs carry an institutional factory warranty. In the rare event that an item arrives with functional engineering anomalies or shipping fractures, the client has exactly seven (7) calendar days from the delivery log timestamp to report the defect. Upon verification by our QA desk, we will dispatch an identical, brand-new replacement unit to the client at zero additional logistical expense.",
    ],
  },
];

/** Plain-text form used in commitment acceptance UI. */
export const USER_AGREEMENT = [
  "ECHARIS TRADING LIMITED",
  USER_AGREEMENT_TITLE,
  "",
  USER_AGREEMENT_INTRO,
  "",
  ...USER_AGREEMENT_SECTIONS.flatMap((section) => [
    section.heading,
    "",
    ...section.paragraphs.flatMap((paragraph) => [paragraph, ""]),
  ]),
]
  .join("\n")
  .trim();
