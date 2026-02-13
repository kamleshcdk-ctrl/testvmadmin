FROM node:20.14.0

# Workaround till we can upgrade NODE
# RUN npm config set unsafe-perm true

RUN apk add --no-cache git && npm install -g apollo

WORKDIR /app

ENV NODE_ENV=development

COPY .npmrc package.json package-lock.json /app/

RUN npm ci

COPY . /app

CMD npm run dev --host

EXPOSE 8079 
