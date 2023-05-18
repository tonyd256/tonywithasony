const stripe = require('stripe')(process.env.STRIPE_API_KEY);

export default async function (request, context) {
  const url = new URL(request.url);
  if (!url.searchParams.get("session_id")) {
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(url.searchParams.get("session_id"));
  const customer = session["customer_details"];
  const lineItems = await stripe.checkout.sessions.listLineItems(url.searchParams.get("session_id"));

  const response = await context.next();
  const page = await response.text();

  const imageRegex = /OBJECT_DATA/i;

  const updatedPage = page.replace(imageRegex, JSON.toString(lineItems));

  return new Response(updatedPage, response);
}
