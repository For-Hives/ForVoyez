Voici le README mis à jour avec les suggestions et les réponses à vos questions :

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

Then, you can connect to the database using the following command:

1. Clone the repository: `git clone https://github.com/your-username/forvoyez.git`
2. Navigate to the project directory: `cd forvoyez`
3. Install dependencies: `npm install` or `bun install`
4. Set up the PostgreSQL database using the provided Docker command (see README for details).
5. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
6. Run database migrations: `npm run prisma-migrate`
7. Generate Prisma client: `npm run prisma-generate`
8. Start the development server: `npm run dev`

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

## Support

If you encounter any issues, have questions, or need assistance, please don't hesitate to reach out to our support team at [support@forvoyez.com](mailto:support@forvoyez.com) or visit our [contact page](https://forvoyez.com/contact).

---

🌟 Boost your image SEO with ForVoyez - the ultimate AI-powered image metadata generation solution! 🌟