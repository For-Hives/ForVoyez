ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /usr/src/app

RUN corepack enable
RUN apt update && apt install -y openssl


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /tmp/dev

COPY package.json pnpm-lock.yaml /tmp/dev/
RUN cd /tmp/dev && pnpm install --frozen-lockfile  --verbose --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /tmp/prod
COPY package.json pnpm-lock.yaml /tmp/prod/
RUN cd /tmp/prod && pnpm install --frozen-lockfile --production --ignore-scripts  && chmod -R 755 node_modules && chown -R node:node node_modules

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY --from=install /tmp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV production

RUN pnpm run prisma:generate
RUN pnpm run build

RUN chmod -R 777 /usr/src/app/.next/cache

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install /tmp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next .next
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/prisma prisma

ENV NODE_ENV production
ENV PATH /usr/src/app/node_modules/.bin:$PATH

USER root

EXPOSE 3000/tcp
ENTRYPOINT [ "pnpm", "run", "launch" ]
