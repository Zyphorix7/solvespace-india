import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import { verifyIndianPincode } from '../src/data/pincodes.ts';

// Initialize Gemini SDK with User-Agent telemetry as mandated by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Resilient Gemini Content Generation with automatic model fallback:
 * If 'gemini-3.8-flash' experiences temporary demand spikes (503/429/UNAVAILABLE),
 * it seamlessly fails over to 'gemini-3.1-flash-lite' before falling back to local domain heuristics.
 */
async function generateGeminiContentWithFallback(options: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      const isDemandSpike =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isDemandSpike && i < modelsToTry.length - 1) {
        console.warn(`[Gemini] ${model} unavailable due to demand spikes (503). Retrying with ${modelsToTry[i + 1]}...`);
        // Short jitter before fallback
        await new Promise((r) => setTimeout(r, 350));
        continue;
      }

      console.warn(`[Gemini] Attempt with ${model} ended:`, err?.message || 'Unknown issue');
      if (i === modelsToTry.length - 1) {
        break;
      }
    }
  }

  return null;
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

export async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void
): Promise<boolean> {
  const url = req.url || '';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  // 1. Instantaneous Indian Pincode Verification Endpoint
  if (url.startsWith('/api/pincode/verify')) {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const result = verifyIndianPincode(body.pincode);
      sendJson(res, 200, result);
    } catch (err: any) {
      sendJson(res, 400, { error: 'Invalid request body', details: err?.message });
    }
    return true;
  }

  // 2. Gemini Multi-Turn Shopping Chatbot Assistant
  if (url.startsWith('/api/ai/chat')) {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { messages, context } = body;

      const systemInstruction = `You are "SS AI", the dedicated AI Product Expert & Culinary Tech Consultant for SolveSpace India (https://solvespace.in). SolveSpace India is an elite Indian consumer technology and smart home brand engineered for modern, fast-paced Indian lifestyles.

Your Core Catalog & Expertise:
1. Flagship Product: "Wireless Electric Mini Food Chopper & Garlic Mincer"
   - Price: ₹899 (Launch offer, MRP ₹1,499 with 40% discount).
   - Blades: High-grade 304 food-grade stainless steel triple-layer S-curve blades for multi-angle cyclone cutting.
   - Motor: High-torque 30W motor with 1-touch ergonomic pulse control (press to chop, release to stop).
   - Battery & Charging: Cordless lithium battery offering 35+ chopping sessions per charge with silicone-sealed water-resistant USB charging.
   - Capacity: 100% food-grade BPA-free 250ml container bowl.
   - Applications: Mincing whole garlic cloves, onions (no tears!), ginger, green chilies, nuts, herbs, and infant baby purees in under 10 seconds.
   - Maintenance: IPX6 detachable modular design for instant 5-second tap water rinsing. Zero food traps.
2. Store Logistics & Indian Policies:
   - Express courier dispatch via Delhivery & Blue Dart across 28,000+ Indian pincodes (Next-day in Bengaluru; 2-3 days in metros like Mumbai, Delhi-NCR, Hyderabad, Chennai, Pune; 3-5 days for others).
   - Payments: Cashfree Instant UPI (PhonePe, Google Pay, Paytm, Cards, NetBanking) and Cash on Delivery (COD). Free delivery on orders over ₹999 (standard fee ₹99).
   - Policy: 5-Day Doorstep Product Exchange & Replacement for defects or transit issues. We operate strictly on an exchange/replacement basis.
   - Confidentiality: Never mention third-party marketplaces (e.g. Meesho, Amazon). Represent SolveSpace India as an independent, precision-engineered brand.
3. Interactive Recommendations:
   - Whenever you recommend a product from the catalog, include a tag in this exact format: [RECOMMEND: Wireless Electric Mini Food Chopper & Garlic Mincer] so our interactive UI renders a 1-click live product card.

Tone & Style:
- Warm, polite ("Namaste!"), knowledgeable, concise, and helpful.
- Provide crisp, actionable advice with bullet points for easy reading.`;

      // Convert messages to Gemini contents format
      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || '' }],
      }));

      // Add context if provided
      if (context && formattedContents.length > 0) {
        formattedContents[formattedContents.length - 1].parts.push({
          text: `\n[Context: ${JSON.stringify(context)}]`,
        });
      }

      const generatedReply = await generateGeminiContentWithFallback({
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      sendJson(res, 200, {
        reply:
          generatedReply ||
          "Namaste! Welcome to SolveSpace India. Our flagship Wireless Electric Mini Food Chopper minces garlic, onions, and veggies in under 10 seconds with 304 stainless steel triple blades and cordless USB-C charging. We offer express dispatch across 28,000+ Indian pincodes, Cash on Delivery, and 5-Day doorstep exchange! How can I assist you today?\n\n[RECOMMEND: Wireless Electric Mini Food Chopper & Garlic Mincer]",
      });
    } catch (err: any) {
      console.warn('Gemini Chat handled gracefully:', err?.message || err);
      sendJson(res, 200, {
        reply:
          "Namaste! Welcome to SolveSpace India. We offer express dispatch across 28,000+ Indian pincodes with Cash on Delivery and 5-Day doorstep product replacement. How can I help you with our Wireless Electric Mini Chopper today?\n\n[RECOMMEND: Wireless Electric Mini Food Chopper & Garlic Mincer]",
      });
    }
    return true;
  }

  // 3. Gemini Admin Store Insights & CRO Recommendations
  if (url.startsWith('/api/ai/insights')) {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }

    const fallbackInsights = [
      {
        title: 'Free Shipping Threshold Upsell (₹899 → ₹999)',
        category: 'revenue',
        type: 'opportunity',
        impact: 'high',
        description: 'At the ₹899 selling price, customers are just ₹100 away from unlocking ₹999 free express delivery across India.',
        actionableStep: 'Promote spare 304 stainless replacement blades or a 350ml expansion bowl (₹199–₹299) directly in the Cart Drawer to boost Average Order Value.',
      },
      {
        title: 'Automate WhatsApp COD Verification for Kitchen Gadgets',
        category: 'cro',
        type: 'opportunity',
        impact: 'high',
        description: 'Kitchen appliances in India experience over 60% Cash on Delivery checkout preference. Automated OTP confirmation locks in customer intent.',
        actionableStep: 'Keep the 1-click COD confirmation active to reduce Return-to-Origin (RTO) delivery failures by up to 28%.',
      },
      {
        title: 'Maintain 40+ Unit Inventory Buffer on 250ml Chopper',
        category: 'inventory',
        type: 'warning',
        impact: 'high',
        description: 'The Matte Black 250ml mini chopper is the primary flagship SKU with high seasonal search intent for daily meal prep.',
        actionableStep: 'Set reorder alerts when inventory drops below 15 units to account for 3–5 day regional supplier replenishment.',
      },
      {
        title: 'Drive UPI Pre-Payments via Cashfree Instant Checkout',
        category: 'marketing',
        type: 'tip',
        impact: 'medium',
        description: 'Indian shoppers paying through PhonePe, GPay, or Paytm UPI complete checkouts in under 20 seconds with 94%+ payment success.',
        actionableStep: 'Highlight "Instant UPI Available" on the product detail page and checkout modal to increase prepaid order share.',
      },
    ];

    try {
      const body = await parseJsonBody(req);
      const { catalogStats, orderStats } = body;

      const prompt = `As a Shopify-Plus CRO expert and Senior E-commerce Data Analyst for the Indian brand 'SolveSpace India', analyze the current store performance data and generate 4 high-impact, actionable insights in JSON format:
Data:
- Catalog Products Count: ${catalogStats?.totalProducts ?? 0}
- Low Stock Items: ${catalogStats?.lowStockCount ?? 0}
- Total Revenue: ₹${orderStats?.totalRevenue ?? 0}
- Total Orders: ${orderStats?.totalOrders ?? 0}
- Pending Shipments: ${orderStats?.pendingShipments ?? 0}

Respond with a raw JSON array of objects with the exact schema:
[
  {
    "title": "Short punchy insight title",
    "category": "inventory" | "cro" | "revenue" | "marketing",
    "type": "opportunity" | "warning" | "tip",
    "impact": "high" | "medium" | "low",
    "description": "Clear explanation grounded in Indian consumer behavior",
    "actionableStep": "Direct recommended action the store manager should take immediately"
  }
]`;

      const generatedText = await generateGeminiContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      if (generatedText) {
        try {
          const parsed = JSON.parse(generatedText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            sendJson(res, 200, { insights: parsed });
            return true;
          }
        } catch {
          // If parse fails, fall through to fallback insights
        }
      }

      sendJson(res, 200, { insights: fallbackInsights });
    } catch (err: any) {
      console.warn('Gemini Insights handled gracefully:', err?.message || err);
      sendJson(res, 200, { insights: fallbackInsights });
    }
    return true;
  }

  // 4. Gemini Product Description Generator for CMS
  if (url.startsWith('/api/ai/generate-product')) {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { title, category } = body;

      const prompt = `Write a high-converting, premium product listing for 'SolveSpace India' (modern tech & ergonomic lifestyle brand in India).
Product Title: "${title}"
Category: "${category}"

Return pure JSON with:
{
  "subtitle": "Inspiring one-line tagline",
  "description": "Engaging 2-3 sentence description emphasizing build quality, ergonomics, and daily life transformation",
  "suggestedPrice": 1999,
  "suggestedCompareAtPrice": 2999,
  "features": [
    "Bullet 1 highlighting premium materials",
    "Bullet 2 highlighting performance or ergonomics",
    "Bullet 3 highlighting durability or warranty",
    "Bullet 4 tailored for Indian climate/usage"
  ],
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const generatedText = await generateGeminiContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (generatedText) {
        try {
          const parsed = JSON.parse(generatedText);
          sendJson(res, 200, parsed);
          return true;
        } catch {
          // Fall through to fallback product copy
        }
      }

      // Default high quality fallback product copy
      sendJson(res, 200, {
        subtitle: `Engineered for modern Indian workspaces`,
        description: `The ${title || 'SolveSpace product'} delivers superior ergonomics, crafted with aerospace-grade materials designed for long hours and daily performance.`,
        suggestedPrice: 1499,
        suggestedCompareAtPrice: 2499,
        features: [
          'Precision CNC-machined alloy with heat dissipation coating',
          'Ergonomic posture support engineered for Indian work habits',
          '5-day hassle-free doorstep product replacement warranty',
          'Compatible across laptops, tablets, and modern smart setups',
        ],
        tags: [category || 'tech', 'ergonomics', 'solvespace', 'premium'],
      });
    } catch (err: any) {
      console.warn('Gemini Product Copy handled gracefully:', err?.message || err);
      sendJson(res, 200, {
        subtitle: `Engineered for modern Indian workspaces`,
        description: `Premium build quality and refined ergonomics tailored for productive lifestyles.`,
        suggestedPrice: 1499,
        suggestedCompareAtPrice: 2499,
        features: [
          'Precision build with durable matte finish',
          'Optimized for Indian office and home setups',
          '5-day doorstep product exchange support',
        ],
        tags: ['workspace', 'tech', 'bestseller'],
      });
    }
    return true;
  }

  return false;
}
