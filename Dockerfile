FROM node

WORKDIR /app

COPY . .

RUN npm i -g bun
RUN bun i
RUN bunx prisma generate
RUN bunx node-prune

ENV TZ="Asia/Singapore"
CMD bun start