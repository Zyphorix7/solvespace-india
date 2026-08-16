# YOUR BRAND — GitHub Pages storefront

This is a static HTML/CSS/JavaScript storefront.

## Important BuySeloma integration status

The official BuySeloma website currently states that its Pro plan includes a "custom website with API access". However, no public API specification, authentication method, endpoint documentation, or official checkout integration documentation could be verified from the publicly indexed pages available at build time.

Therefore this project intentionally does **not** invent API endpoints, payment processing, order submission, or credentials.

Before production launch, obtain from BuySeloma:
- official API documentation or official hosted-checkout documentation
- authentication method
- product/catalog endpoints
- cart/order creation endpoint
- checkout/payment flow
- webhook/order-status documentation
- CORS/browser requirements
- required plan
- test/sandbox procedure

If the API requires a secret key, it must be used through a secure server/serverless function, never in `script.js`.

## GitHub Pages

Upload `index.html`, `style.css`, `script.js`, and `assets/` to the repository root. Enable Pages from the repository's Pages settings and select the branch/folder containing the files.

## Product images

Replace the CSS mock product with real optimized images only after you have rights to use them. A recommended future structure is:
assets/images/product-1.webp
assets/images/product-1-2.webp
