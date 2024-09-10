const { SNSClient, ConfirmSubscriptionCommand } = require("@aws-sdk/client-sns");
require('dotenv').config();

export default async (req, context) => {
  try {
    console.dir(req, { depth: null });
    console.dir(context, { depth: null });
    if (req.body.Type === "SubscriptionConfirmation") {
      const client = new SNSClient({
        credentials: {
          accessKeyId: process.env.SNS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.SNS_AWS_SECRET_ACCESS_KEY
        },
        region: "us-west-2"
      });
      const options = {
        TopicArn: req.headers['x-amz-sns-topic-arn'],
        Token: req.body.Token
      };

      const result = await client.send(new ConfirmSubscriptionCommand(options));
      return Response.json({}, { status: 200 });
    }

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.msg }, { status: 500 });
  }
}
