import Stripe from 'https://cdn.jsdelivr.net/npm/stripe@12.5.0/+esm';


export default async (request, context) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

  const url = new URL(request.url);
  if (!url.searchParams.get("session_id")) {
    const url = new URL("/", req.url);
    return Response.redirect(url);
  }

  const session = await stripe.checkout.sessions.retrieve(url.searchParams.get("session_id"));
  const customer = session["customer_details"];
  const lineItems = await stripe.checkout.sessions.listLineItems(url.searchParams.get("session_id"));
  const product = await stripe.products.retrieve(lineItems.data[0].price.product);

  const response = await context.next();
  const page = await response.text();

  const imageRegex = /IMAGE_URL/i;
  const productRegex = /PRODUCT_NAME/i;
  const customerRegex = /CUSTOMER_NAME/i;

  const imagePage = page.replace(imageRegex, product.images[0]);
  const productPage = imagePage.replace(productRegex, product.name);
  const updatedPage = productPage.replace(customerRegex, customer.name);

  return new Response(updatedPage, response);
}

export const config = { path: "/thankyou/" };
