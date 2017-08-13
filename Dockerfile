FROM node:8.2

WORKDIR /service
ENV NODE_ENV production
ADD . /service
RUN npm install --production

EXPOSE 8080
CMD ["node", "--harmony", "./index.js"]
