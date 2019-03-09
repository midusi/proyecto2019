FROM node:10.7

LABEL mantainer="Ulises Jeremias Cornejo Fandos <ulisescf.24@gmail.com>"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN yarn

EXPOSE 8091

CMD [ "yarn", "serve:dev" ]
