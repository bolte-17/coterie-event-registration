FROM node:20-alpine AS build
WORKDIR /workspace
COPY . .
RUN npm ci
RUN npm run build

FROM node:20-alpine AS release
WORKDIR /app
COPY --from=build /workspace/dist ./dist
COPY package.json .
COPY package-lock.json .
RUN npm ci --production
CMD [ "npm", "start" ]
