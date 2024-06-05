#!/bin/bash

# Load .env file
set -o allexport
source ../.env
set +o allexport

# Construct Docker build command with build arguments
docker build \
  --build-arg NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  --build-arg CLERK_SECRET_KEY=$CLERK_SECRET_KEY \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_OUT_URL=$NEXT_PUBLIC_CLERK_SIGN_OUT_URL \
  --build-arg MAILGUN_API_KEY=$MAILGUN_API_KEY \
  --build-arg MAILGUN_API_URL=$MAILGUN_API_URL \
  --build-arg MAILGUN_PUBLIC_KEY=$MAILGUN_PUBLIC_KEY \
  --build-arg MAILGUN_DOMAIN=$MAILGUN_DOMAIN \
  --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
  --build-arg JWT_SECRET=$JWT_SECRET \
  --build-arg LEMON_SQUEEZY_API_KEY=$LEMON_SQUEEZY_API_KEY \
  --build-arg LEMON_SQUEEZY_STORE_ID=$LEMON_SQUEEZY_STORE_ID \
  --build-arg LEMON_SQUEEZY_WEBHOOK_SECRET=$LEMON_SQUEEZY_WEBHOOK_SECRET \
  --build-arg DATABASE_URL=$DATABASE_URL \
  --build-arg TEST_EMAIL=$TEST_EMAIL \
  --build-arg TEST_PASSWORD=$TEST_PASSWORD \
  --build-arg TEST_EMAIL_SUB=$TEST_EMAIL_SUB \
  --build-arg TEST_PASSWORD_SUB=$TEST_PASSWORD_SUB \
  --build-arg ENABLE_TEST_LOGS=$ENABLE_TEST_LOGS \
  -f Dockerfile.test -t my-app:test .
