const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Méthode non autorisée");
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { email, produits, metadata } = body || {};
    if (!email || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).send("Requête invalide");
    }
    const line_items = produits.map((p) => ({ price: p.id, quantity: p.qty }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items,
      mode: "payment",
      success_url: process.env.SUCCESS_URL || "https://example.com/success",
      cancel_url: process.env.CANCEL_URL || "https://example.com/cancel",
      metadata: metadata || {}
    });
    return res.status(200).send(session.url);
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return res.status(500).send("Erreur serveur Stripe");
  }
}
