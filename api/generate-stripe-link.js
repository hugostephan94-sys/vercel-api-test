// /api/generate-stripe-link.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Petite aide pour supporter à la fois string et objet en body
function readBody(req) {
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  try {
    const { email, produits = [], metadata = {} } = readBody(req);

    // Validation rapide
    if (!email || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: "email et produits[] requis" });
    }
    // produits attendu: [{ id: "price_XXX", qty: 2 }, ...]

    const line_items = produits.map((p) => ({
      price: p.id,             // ID de PRIX Stripe (pas l'ID produit)
      quantity: Number(p.qty) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items,
      success_url: process.env.SUCCESS_URL || "https://example.com/success",
      cancel_url: process.env.CANCEL_URL || "https://example.com/cancel",
      metadata,
    });

    // On renvoie l’URL Stripe Checkout directement
    return res.status(200).send(session.url);
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Erreur serveur Stripe" });
  }
}
