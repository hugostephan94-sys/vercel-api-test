export default function handler(req, res) {
  // Ne renvoie PAS la clé ! Juste un booléen.
  res.status(200).json({ hasStripeKey: !!process.env.STRIPE_SECRET_KEY });
}
