import Stripe from 'https://cdn.jsdelivr.net/npm/stripe@12.5.0/+esm';


export default async (request, context) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

    const url = new URL(request.url);
    if (!url.searchParams.get("session_id")) {
      const url = new URL("/", request.url);
      return Response.redirect(url);
    }

    const session = await stripe.checkout.sessions.retrieve(url.searchParams.get("session_id"));
    const customer = session["customer_details"] || {name: "Valued Customer"};
    const metadata = session.metadata;

    const response = await context.next();
    const page = await response.text();

    const imageRegex = /IMAGE_URL/i;
    const productRegex = /PRODUCT_NAME/i;
    const customerRegex = /CUSTOMER_NAME/i;

    const imagePage = page.replace(imageRegex, metadata.image_url);
    const productPage = imagePage.replace(productRegex, metadata.name);
    const updatedPage = productPage.replace(customerRegex, customer.name);

    return new Response(updatedPage, response);
  } catch (e) {
    console.error(e);
    const url = new URL("/", request.url);
    return Response.redirect(url);
  }
}

export const config = { path: "/thankyou/" };
