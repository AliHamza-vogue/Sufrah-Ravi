# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **PII Split-Collection Invariant**: A public `/reviews/{reviewId}` document MUST NEVER contain the `email` field. The reviewer's `email` MUST be stored exclusively in `/review_private/{reviewId}`, where `allow read: if false;` prevents any client from reading or scraping customer email addresses.
2. **Atomic Email Requirement Invariant**: A `/reviews/{reviewId}` document cannot be created unless its companion `/review_private/{reviewId}` document containing a valid email address is created atomically in the same batch (`existsAfter(/databases/$(database)/documents/review_private/$(reviewId))`), and vice versa.
3. **Schema & Boundary Invariant**:
   - `author`: `string`, length `2..60`
   - `rating`: `int`, value `1..5`
   - `comment`: `string`, length `3..600`
   - `verified`: `bool`, must be `true`
   - `isPublic`: `bool`, must be `true`
   - `createdAt`: `timestamp`, must equal `request.time`
   - `email` (in `review_private`): `string`, length `5..120`, matching `^[^@\s]+@[^@\s]+\.[^@\s]+$`
4. **Immutability Invariant**: Neither `/reviews/{reviewId}` nor `/review_private/{reviewId}` can be updated or deleted once created (`allow update, delete: if false;`).

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Missing Private Email Companion)**: Creating `/reviews/rev1` without creating `/review_private/rev1` in the same batch.
2. **Payload 2 (Invalid Email Format)**: Creating `/review_private/rev2` with `email: "not-an-email"`.
3. **Payload 3 (Email Leaked in Public Review)**: Creating `/reviews/rev3` with an extra `email: "test@example.com"` field (Shadow Field Attack).
4. **Payload 4 (Out-of-Bounds Rating)**: Creating `/reviews/rev4` with `rating: 10` or `rating: 0`.
5. **Payload 5 (Empty/Short Author)**: Creating `/reviews/rev5` with `author: "A"` (less than 2 chars).
6. **Payload 6 (Oversized Comment DoW)**: Creating `/reviews/rev6` with a 5,000-character `comment` string (exceeds 600 chars).
7. **Payload 7 (Forged Timestamp)**: Creating `/reviews/rev7` with a past or future `createdAt` timestamp not equal to `request.time`.
8. **Payload 8 (PII Read Attempt)**: Attempting `get` or `list` on `/review_private/rev1` to steal customer emails.
9. **Payload 9 (Unauthorized Update/Tampering)**: Attempting `update` on `/reviews/rev1` to alter `rating` or `comment`.
10. **Payload 10 (Unauthorized Deletion)**: Attempting `delete` on `/reviews/rev1`.
11. **Payload 11 (ID Poisoning)**: Creating a review with an invalid document ID containing special characters or exceeding 128 chars.
12. **Payload 12 (Unbounded Query Scraping)**: Listing `/reviews` without constraining `isPublic == true`.

## 3. Test Runner Specification (`firestore.rules.test.ts`)

See `/firestore.rules.test.ts` for the complete test suite verifying that all 12 Dirty Dozen payloads return `PERMISSION_DENIED`.
