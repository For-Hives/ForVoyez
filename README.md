# ForVoyez - AI-Powered Image Metadata Generation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.3-38B2AC.svg)](https://tailwindcss.com/)

ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for images using advanced AI technology. Our API processes your images and returns metadata in a customizable JSON format, making it easy to integrate into your existing workflows and boost your search engine rankings.

## Features

- 🚀 Automatic generation of SEO-friendly alt text, titles, and captions
- 🎨 Support for various image formats (JPEG, PNG, WebP, GIF)
- 📊 Customizable JSON schema for tailored metadata output
- 🔒 Secure API access with generated tokens
- 📈 Detailed usage statistics and monitoring
- 💸 Flexible pricing plans to suit your needs and scale with your business
- 🧪 Interactive API playground for testing and experimentation
- 📚 Comprehensive documentation and code examples

## Stats of the project

![Alt](https://repobeats.axiom.co/api/embed/17af2432e9de75f50d1ef3a3a31033d157ace915.svg "Repobeats analytics image")

## Getting Started

To get started with ForVoyez, follow these steps:

1. Sign up for an account at [forvoyez.com/sign-up](https://forvoyez.com/sign-up).
2. Choose a pricing plan that suits your needs.
3. Generate an API token in your dashboard.
4. Integrate the ForVoyez API into your application using the provided documentation and code examples.
5. Start generating SEO-optimized image metadata and boost your search engine rankings!

## Prerequisites

To run the ForVoyez project locally, ensure you have the following dependencies installed:

- Node.js (v20.x or higher)
- npm (v10.x or higher)
- PostgreSQL (v16.x or higher)

## Development

To set up the development environment for ForVoyez, follow these steps:

You can use the following Docker command to set up a PostgreSQL database for local development:

```bash
docker run --name forvoyez-postgres -e POSTGRES_USER=forvoyez -e POSTGRES_PASSWORD=forvoyez -e POSTGRES_DB=forvoyez -p 5432:5432 -d postgres
```

If you want to configure your .env file to connect to the database, you can use the following environment variables:

```bash
DATABASE_URL="postgresql://forvoyez:forvoyez@localhost:5432/forvoyez"
```

Then, you can connect to the database using the following command:

1. Clone the repository: `git clone https://github.com/For-Hives/ForVoyez.git`
2. Navigate to the project directory: `cd forvoyez`
3. Install dependencies: `npm install` or `bun install`
4. Set up the PostgreSQL database using the provided Docker command (see README for details).
5. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
6. Run database migrations: `npm run prisma-migrate`
7. Generate Prisma client: `npm run prisma-generate`
8. Start the development server: `npm run dev`

## Webhook Configuration for Local Development

To test and develop the Lemonsqueezy webhook locally, follow these steps:

### Prerequisites

- Ensure you have Node.js installed on your machine.
- Verify that you have set the required environment variables in your `.env` file, particularly `LEMON_SQUEEZY_WEBHOOK_SECRET`, which should contain your Lemonsqueezy webhook secret key.

### Steps

1. Go to [https://webhook.site/](https://webhook.site/) and copy your unique URL.

2. Start your local development server by running the following command in the terminal at the root of your project:
   `npm run dev` or `bun dev`  
   This will start your Next.js server, which will listen on `http://localhost:3000` by default.

3. Globally install the `@webhooksite/cli` package by running the following command:

   ```
   npm install -g @webhooksite/cli
   ```

   This will install the Webhook.site command-line tool, which will allow you to forward webhooks to your local server.

4. Go to the Lemonsqueezy account settings and configure the webhook URL to point to the unique URL provided by Webhook.site.

5. Run the following command to forward webhooks to your local server:

   ```
   whcli forward --token=<your-token> --target=http://localhost:3000
   ```

   Replace `<your-token>` with the token provided by Webhook.site. This command will forward the received webhooks from Webhook.site to your local `/api/webhook` endpoint.

6. Configure the webhook URL in your Lemonsqueezy account settings to point to the unique URL provided by Webhook.site.

7. Perform an action in Lemonsqueezy that will trigger a webhook (e.g., a test payment).

8. Check your development server logs. You should see the details of the received webhook, indicating that your local endpoint has successfully processed the request.

### Use ngrok for Local Development as an Alternative to Webhook.site

you can use ngrok to create a secure tunnel to your local server and receive webhooks from Lemonsqueezy. Follow these steps:

1. Download and install ngrok from [https://ngrok.com/download](https://ngrok.com/download).
2. Start your local development server by running the following command in the terminal at the root of your project:
   `npm run dev` or `bun dev`
   This will start your Next.js server, which will listen on `http://localhost:3000` by default.
3. Go to ngrok's admin interface on the website [https://dashboard.ngrok.com/get-started/setup](https://dashboard.ngrok.com/get-started/setup) and copy your unique URL.
4. You can create a static domain on the interface and use it for your webhook.
5. Go to the Lemonsqueezy account settings and configure the webhook URL to point to the unique URL provided by ngrok.
6. Run the following command to forward webhooks to your local server:
   ```
   ngrok http --domain=[yourdomain] 3000
   ```
   This command will create a secure tunnel to your local server, and you will receive a unique URL that you can use to forward webhooks to your local server.
7. Perform an action in Lemonsqueezy that will trigger a webhook (e.g., a test payment).

### Troubleshooting

- If you encounter errors related to HTTPS when forwarding webhooks to your local server, make sure to use `http://` instead of `https://` in the target URL.

- If your local server is not responding, verify that it is running and listening on the correct port (by default, `3000` for Next.js). You can also check the server logs for any relevant error messages.

## Image Metadata Generation Process

ForVoyez leverages the power of OpenAI's advanced language models to generate image metadata. The process involves the following steps:

1. The user sends an image file along with optional context and a custom JSON schema to the ForVoyez API.
2. The image is preprocessed and analyzed using computer vision techniques.
3. The extracted visual features are combined with the provided context and fed into OpenAI's language models.
4. The language models generate relevant and SEO-optimized alternative text, titles, and captions based on the image content and context.
5. The generated metadata is structured according to the provided JSON schema and returned to the user.

ForVoyez continuously improves its metadata generation capabilities by fine-tuning the language models on a diverse dataset of image-metadata pairs.

## API Usage Tracking

Users can monitor their API usage and quota limits directly through the ForVoyez web interface. The dashboard provides detailed statistics and charts showing the number of API calls made, credits consumed, and remaining quota for the current billing period.

## Bug Reports and Feature Requests

If you encounter any bugs, have feature requests, or want to contribute to the project, please email us at [support@forvoyez.com](mailto:support@forvoyez.com). Our team will assist you and provide guidance on how to report issues or submit pull requests.

## API Usage

To use the ForVoyez API, send a POST request to the `/api/describe` endpoint with the following parameters:

- `image`: The image file to process (JPEG, PNG, WebP, GIF).
- `context` (optional): Additional context or information about the image to guide the metadata generation process.
- `jsonSchema` (optional): A custom JSON schema defining the desired output format for the generated metadata.

Example Request:

```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_TOKEN>" -F "image=@/path/to/image.jpg" -F "context=A beautiful sunset over the ocean" -F "jsonSchema={\"title\": \"string\", \"alt\": \"string\", \"caption\": \"string\"}" https://api.forvoyez.com/describe
```

Example Response:

```json
{
	"title": "Serene Sunset Over the Calm Ocean Waves",
	"alt": "A breathtaking sunset with vibrant orange and pink hues reflected on the tranquil ocean surface, creating a peaceful and mesmerizing seascape.",
	"caption": "Witness the enchanting beauty of a serene sunset over the calm ocean waves, as the vibrant colors paint the sky and the gentle breeze carries the salty scent of the sea."
}
```

## Environment Variables

To run the ForVoyez project, you need to set up the environment variables in a `.env` file.
You must follow the `.env.example` file to define the required variables.
Make sure to replace the placeholders with your actual values for each environment variable.

## Support

If you encounter any issues, have questions, or need assistance, please don't hesitate to reach out to our support team at [support@forvoyez.com](mailto:support@forvoyez.com) or visit our [contact page](https://forvoyez.com/contact).

---

🌟 Boost your image SEO with ForVoyez - the ultimate AI-powered image metadata generation solution! 🌟
