const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const products = {
  '4x6': 1000,
  '5x7': 1200,
  '6x6': 1200,
  '6x8': 1400,
  '8x8': 1500,
  '8x10': 2000,
  '8x12': 2100,
  '9x12': 2300,
  '10x10': 2300,
  '11x14': 2500,
  '12x12': 2300,
  '12x18': 3000,
  '16x16': 4000,
  '16x20': 4000,
  '16x24': 4000,
  '18x24': 4500,
  '20x20': 5500,
  '20x24': 6000,
  '20x30': 7000
};

exports.handler = async function (event, context) {
  const params = event.queryStringParameters;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'USD',
          product_data: {
            name: params.product + ' Print',
            images: [ params.image_url ],
            metadata: {
              filename: params.filename
            }
          },
          unit_amount: products[params.product]
        },
        quantity: 1,
        adjustable_quantity: {
          enabled: true
        }
      }
    ],
    mode: 'payment',
    success_url: 'https://tonywithasony.com/thankyou?session_id={CHECKOUT_SESSION_ID}',
    shipping_address_collection: {
      allowed_countries: ['US']
    }
  });

  return {
    statusCode: 303,
    headers: {
      'Location': session.url
    }
  };
};
