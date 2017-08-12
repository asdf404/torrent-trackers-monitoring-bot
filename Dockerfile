FROM node:8.2

WORKDIR /service
ADD . /service
RUN npm install

EXPOSE 8080
CMD ["node", "--harmony", "./index.js"]
