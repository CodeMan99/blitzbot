FROM node:16.14-alpine

ENV NODE_ENV "production"
ENV NPM_CONFIG_PREFIX "/home/node/.local"
ENV PATH "/home/node/.local/bin:$PATH"
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && mkdir /home/node/blitzbot /home/node/.local \
    && chown node:node /home/node/blitzbot /home/node/.local
USER node
WORKDIR /home/node/blitzbot/
COPY --chown=node:node package*.json .
RUN npm install --production
COPY --chown=node:node . .
RUN npm link
# for simplicity... probably a bad idea
#EXPOSE 8008
CMD [ "blitzbot" ]
