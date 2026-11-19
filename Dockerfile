FROM node:22-bookworm-slim
LABEL org.opencontainers.image.title="Y'a plouf !" \
      org.opencontainers.image.source="https://github.com/arnou/ya-plouf"
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci && npm run build && npm prune --omit=dev
COPY scripts ./scripts
COPY migrations ./migrations
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm start"]
