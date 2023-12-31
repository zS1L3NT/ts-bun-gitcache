FROM oven/bun

WORKDIR /app

COPY . .

RUN bun i
RUN bunx node-prune

ENV TZ="Asia/Singapore"
CMD bun start