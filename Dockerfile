FROM node:16 as dev

EXPOSE 300

FROM dev as full
# Create app directory
WORKDIR /usr/src/app

#copy package.json and package-lock.json
COPY package*.json ./

#install dependencies
RUN npm install

#copy source
COPY . .