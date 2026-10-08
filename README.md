# ForVoyez - AI-Powered Image Metadata Generation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.7-38B2AC.svg)](https://tailwindcss.com/)

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

![Alt](https://repobeats.axiom.co/api/embed/17af2432e9de75f50d1ef3a3a31033d157ace915.svg 'Repobeats analytics image')

## Getting Started

To get started with ForVoyez, follow these steps:

1. Sign up for an account at [forvoyez.com/sign-up](https://forvoyez.com/sign-up).
2. Choose a pricing plan that suits your needs.
3. Generate an API token in your dashboard.
4. Integrate the ForVoyez API into your application using the provided documentation and code examples.
5. Start generating SEO-optimized image metadata and boost your search engine rankings!

## Prerequisites

To run the ForVoyez project locally, ensure you have the following dependencies installed:

- Node.js (v24.x recommended, v22.12 or higher required; `pnpm prisma:seed` and `node check-db-connection.js` load the generated TypeScript Prisma client directly and need v22.18 or higher). `.nvmrc` pins major 22 for the Nixpacks build on Coolify, whose default would be Node 18 (too old for Next 16 and Prisma 7); a `NIXPACKS_NODE_VERSION` variable on the Coolify app overrides it.
- pnpm (the version pinned in `package.json` `packageManager`, enable it with `corepack enable`)
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

The app reads `DATABASE_URL` the way Prisma 6 did (`src/helpers/databaseUrl.js`), so a production URL keeps working unchanged: without `sslmode` (or with `sslmode=prefer`, or a value Prisma 6 did not know such as `verify-full`), TLS is used when the server offers it and plaintext otherwise; `sslmode=require` needs TLS; `sslmode=disable` turns it off. The certificate is only verified with `sslaccept=strict`, against the CA file given in `sslcert` (relative to `prisma/`) when there is one. Add `uselibpqcompat=true` to use node-postgres' own reading of the libpq parameters instead (`sslmode=verify-full&sslrootcert=...`).

Then, you can connect to the database using the following command:

1. Clone the repository: `git clone https://github.com/For-Hives/ForVoyez.git`
2. Navigate to the project directory: `cd forvoyez`
3. Install dependencies: `pnpm install`
4. Set up the PostgreSQL database using the provided Docker command (see README for details).
5. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
6. Generate Prisma client: `pnpm install` already does it (`postinstall`), run `pnpm prisma:generate` again after changing `prisma/schema.prisma` (the client is generated into `src/generated/prisma`, and `pnpm build` runs this step too)
7. Run database migrations: `pnpm prisma:migrate` (Prisma reads `DATABASE_URL` through `prisma.config.ts`, which loads `.env`)
8. Start the development server: `pnpm dev`

### Comparing AI models

`scripts/compare-models.mjs` runs the previous pipeline (3 sequential `gpt-4o-mini` calls, kept in `scripts/legacy-image-description.mjs`) and the current one (a single vision call with structured output, `src/services/imageDescription.service.js`) on every image of a folder, then writes a side-by-side report with the generated fields, the token usage and the latency. It calls the OpenAI API (4 calls per image), so try it on a small folder first:

```bash
node --env-file=.env scripts/compare-models.mjs ./my-images --context "Wedding photos" --language fr
```

It needs `OPENAI_API_KEY`, accepts `.jpg`, `.jpeg`, `.png`, `.webp` and `.gif`, and writes `compare-models-report/report.md` and `report.json` (`--out` to change the folder). `--model`, `--legacy-model` and `--detail` override the compared models and the image detail; `--help` lists every option.

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

### Failed or repeated webhook events

Every signed event is stored in the `WebhookEvent` table and answered with 200, even when processing fails, so Lemon Squeezy does not retry it.

- A processing failure is logged as `webhook <id> (<event>) processing failed` and its message is stored in `WebhookEvent.processingError` (`processed` stays `false`). For example `Plan not found for variant ...` means the plans must be synced first (`GET /api/sync`).
- To replay a failed event once the cause is fixed, resend it from the Lemon Squeezy dashboard (Settings > Webhooks). Find the failed ones with `SELECT id, "eventName", "processingError" FROM "WebhookEvent" WHERE processed = false AND "processingError" IS NOT NULL;`.
- Lemon Squeezy does not order its webhooks: the invoice of an upgrade (`subscription_payment_success`, billing reason `updated`) processed before its `subscription_plan_changed` fails with `plan change not processed yet`. Resend it once the plan change is processed. The plan change must be a processed `subscription_plan_changed` event to the subscription's current plan: an `oldPlanId` left by the previous version of the app (which never cleared it and never marked events processed) is not taken for it.
- Events that add credits (`order_created`, `subscription_payment_success`) are credited once per Lemon Squeezy order or invoice (`data.id`): a redelivery of an already processed one is stored, marked `processed` with a `Duplicate of webhook event <id>` note, and not credited again.

## Image Metadata Generation Process

ForVoyez uses an OpenAI vision model (`FORVOYEZ_AI_MODEL`, see [Environment Variables](#environment-variables)) to generate image metadata, in a single call per image (`src/services/imageDescription.service.js`):

1. The user sends an image file to `/api/describe` (or the playground), with an optional context, keywords, language and output schema.
2. The image is checked (10 MB maximum; JPEG, PNG, WebP or GIF, read from the file itself, not from the MIME type it was sent with), turned upright and resized to fit 1000x1000 pixels.
3. The image, the context, the keywords and the requested fields are sent to the model in one request, which must answer with structured output: exactly the requested keys, each a string.
4. The generated metadata is returned as a flat JSON object. One credit is charged only when the generation succeeds.

## API Usage Tracking

Users can monitor their API usage and quota limits directly through the ForVoyez web interface. The dashboard provides detailed statistics and charts showing the number of API calls made, credits consumed, and remaining quota for the current billing period.

## Bug Reports and Feature Requests

If you encounter any bugs, have feature requests, or want to contribute to the project, please email us at [support@forvoyez.com](mailto:support@forvoyez.com). Our team will assist you and provide guidance on how to report issues or submit pull requests.

## API Usage

The full reference is at [doc.forvoyez.com](https://doc.forvoyez.com/describe). In short, send a `multipart/form-data` POST request to `https://forvoyez.com/api/describe` with an API key from the dashboard (`Authorization: Bearer <YOUR_API_TOKEN>`) and the following fields:

- `image`: the image file to process (JPEG, PNG, WebP, GIF, 10 MB maximum). The format is read from the file, so its MIME type does not matter (`curl -F image=@photo.webp` sends `application/octet-stream`); another format, such as SVG, AVIF or TIFF, gets a 400 `Bad Request, Invalid image file`.
- `context` (optional): additional information about the image to guide the generation.
- `keywords` (optional): keywords to work into the metadata.
- `language` (optional): language of the generated metadata, `en` by default. A language code (`it`, `pt-BR`, `he_IL`) is given to the model by its name (Italian, Brazilian Portuguese, Hebrew (Israel)); any other value is passed as written.
- `schema` (optional): a JSON string, a flat map of output field name to description. Without it, the fields are `title`, `alternativeText` and `caption`, and the response also has `alt_text`, a copy of `alternativeText` that the WordPress plugin up to 1.1.40 reads.

Example Request:

```bash
curl -X POST -H "Authorization: Bearer <YOUR_API_TOKEN>" -F "image=@/path/to/image.jpg" -F "context=A beautiful sunset over the ocean" -F "language=en" https://forvoyez.com/api/describe
```

Example Response (200, exactly the schema keys, plus `alt_text` because this request sends no `schema`):

```json
{
	"title": "Serene Sunset Over the Calm Ocean Waves",
	"alternativeText": "A breathtaking sunset with vibrant orange and pink hues reflected on the tranquil ocean surface, creating a peaceful and mesmerizing seascape.",
	"caption": "Witness the enchanting beauty of a serene sunset over the calm ocean waves, as the vibrant colors paint the sky and the gentle breeze carries the salty scent of the sea.",
	"alt_text": "A breathtaking sunset with vibrant orange and pink hues reflected on the tranquil ocean surface, creating a peaceful and mesmerizing seascape."
}
```

Errors keep their HTTP status (400 invalid request, 401 missing, invalid, revoked or expired API key, or no credit left, 413 image over 10 MB, 500 server error) and have a JSON body: `{ "error": "<human message>" }`. An image over 10 MB, or a request body over 11 MB, gets a 413 `Image too large: the maximum is 10 MB`; a body that is not `multipart/form-data` gets a 400. No credit is charged for any error. A schema whose fields need more than about 1,500 words in total gets a 400 `Invalid schema: the requested fields need a longer answer than the API can return ...` (the generation stops at its output limit, the credit is refunded).

## Environment Variables

To run the ForVoyez project, you need to set up the environment variables in a `.env` file.
You must follow the `.env.example` file to define the required variables.
Make sure to replace the placeholders with your actual values for each environment variable.

Optional variables:

- `FORVOYEZ_AI_MODEL`: OpenAI model used by `/api/describe` and the playground (default `gpt-6-luna`, same `OPENAI_API_KEY`). Set it to `gpt-5.6-luna` (tied on quality in the October 2026 evaluation, about 2x the cost) or `gpt-4o-mini` (previous model) to roll back without a code change.
- `FORVOYEZ_AI_IMAGE_DETAIL`: OpenAI image detail sent with each image, `low` (default), `auto` or `high`.
- `SYNC_SECRET`: enables `GET /api/sync` (copies the Lemon Squeezy products into the `Plan` table). Call it with the header `x-sync-secret: <SYNC_SECRET>` (the former `?true=true` query is no longer used); without the variable, or with a wrong header, the route answers 404. Run it after adding or changing a product or variant in Lemon Squeezy, otherwise purchases of that variant fail with `Plan not found`.

## Support

If you encounter any issues, have questions, or need assistance, please don't hesitate to reach out to our support team at [support@forvoyez.com](mailto:support@forvoyez.com) or visit our [contact page](https://forvoyez.com/contact).

---

🌟 Boost your image SEO with ForVoyez - the ultimate AI-powered image metadata generation solution! 🌟
