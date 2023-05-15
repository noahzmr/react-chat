FROM node:18.15

RUN mkdir -p /noerkelit/chat/ui

COPY . /

WORKDIR /noerkelit/chat/ui
RUN npm install

CMD ["npm","start"]
