# Built from the root of the repository (context .), because the assistant reads the site's customer docs:
# docker build -f chat/Dockerfile .
FROM node:22-alpine
WORKDIR /app
COPY chat/package.json chat/package-lock.json ./
RUN npm ci --omit=dev
COPY chat/src ./src
COPY chat/persona.md ./
COPY chat/knowledge ./knowledge
COPY site/src/content/docs ./knowledge/docs
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "src/server.js"]
