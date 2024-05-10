# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apt update && apt install -y openssl

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev

COPY package.json pnpm-lock.yaml /temp/dev/
RUN cd /temp/dev && pnpm install --frozen-lockfile  --verbose --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV production

RUN pnpm run prisma
RUN pnpm run build

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next .next
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .

ENV NODE_ENV production
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# run the app
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000/tcp
ENTRYPOINT [ "pnpm", "run", "start" ]
