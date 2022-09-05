FROM node:16

WORKDIR /home/ts-github-notion-sync

COPY . .

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm build

EXPOSE 8080
CMD ["pnpm", "start"]