const { SNSClient, ConfirmSubscriptionCommand } = require("@aws-sdk/client-sns");
require('dotenv').config();

export default async (req, context) => {
  try {
    const data = await req.json();
    console.dir(data, { depth: null });

    if (req.headers.get("x-amz-sns-message-type") === "SubscriptionConfirmation") {
      const client = new SNSClient({
        credentials: {
          accessKeyId: Netlify.env.get("SNS_AWS_ACCESS_KEY_ID"),
          secretAccessKey: Netlify.env.get("SNS_AWS_SECRET_ACCESS_KEY")
        },
        region: "us-west-2"
      });
      const options = {
        TopicArn: req.headers.get('x-amz-sns-topic-arn'),
        Token: data.Token
      };

      const result = await client.send(new ConfirmSubscriptionCommand(options));
      return Response.json({}, { status: 200 });
    }

  } catch (error) {
    console.error(error);
    return Response.json({ error: "unknown error" }, { status: 500 });
  }
}
