# BuySeloma integration handoff

As of August 16, 2026, BuySeloma's public website says:
- dropshippers can create a public store URL
- COD and online payments are handled by BuySeloma
- the Pro plan includes a custom website with API access

I could not verify public API documentation or a public hosted-checkout specification from the indexed official pages. This means a production integration cannot responsibly be fabricated.

## Required information from BuySeloma

Ask BuySeloma support for:
1. API base URL
2. API documentation
3. API authentication method
4. product/catalog read endpoint
5. order/cart creation endpoint
6. payment/checkout endpoint or hosted checkout URL
7. order-status endpoint/webhook
8. required headers and CORS policy
9. required plan and account permissions
10. sandbox/test credentials

## Secure architecture if an API is provided

Customer browser
  -> GitHub Pages frontend
  -> your serverless function
  -> BuySeloma API
  -> BuySeloma order dashboard / fulfillment

Never:
- put API secrets in script.js
- put payment credentials in GitHub
- accept raw card details in the static frontend
- invent an endpoint
- claim an order succeeded until the official API confirms it

If BuySeloma supplies a hosted checkout, the simplest safe architecture is:
Customer -> branded GitHub storefront -> official BuySeloma checkout -> BuySeloma order system.

Whether BuySeloma allows the hosted checkout to be embedded or branded must be confirmed by BuySeloma.
