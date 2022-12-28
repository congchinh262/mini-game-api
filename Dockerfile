FROM node:14-alpine as builder
WORKDIR /app
COPY . .

RUN npm i
RUN npm run initPrisma && npm run build

############################################
FROM node:14-alpine
WORKDIR /app

COPY --from=builder /app/lib lib
COPY --from=builder /app/prisma prisma
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json


CMD [ "npm", "run", "start" ]