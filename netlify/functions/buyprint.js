const stripe = require('stripe')(process.env.STRIPE_API_KEY);

exports.handler = async function (event, context) {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'USD',
          product_data: {
            name: '11x14 Print',
            images: [ event.queryStringParameters.image_url ],
            metadata: {
              filename: event.queryStringParameters.filename
            },
            tax_code: 'txcd_20090028'
          },
          unit_amount: '10',
          tax_behavior: 'exclusive'
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: 'https://tonywithasony.com'
  });

  return {
    statusCode: 303,
    headers: {
      'Location': session.url
    }
  };
};
