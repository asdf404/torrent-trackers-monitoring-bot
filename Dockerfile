FROM node:8.2

WORKDIR /service
ENV NODE_ENV production
ADD . /service
RUN npm install --production

CMD ["node", "--harmony", "./index.js"]
