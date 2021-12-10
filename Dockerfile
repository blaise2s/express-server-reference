FROM node:17.2.0 as builder
ENV NODE_ENV=production
WORKDIR /usr/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/
COPY .yarn/plugins/ .yarn/plugins/
RUN yarn install
COPY . .
RUN yarn build

FROM node:17.2.0 as runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /usr/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/
COPY .yarn/plugins/ .yarn/plugins/
RUN yarn workspaces focus --production
COPY --from=builder /usr/app/dist ./dist
EXPOSE ${PORT}
CMD yarn start
