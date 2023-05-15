FROM node:18.15

RUN mkdir -p /noerkelit/chat/backend

COPY . /noerkelit/chat/backend

WORKDIR /noerkelit/chat/backend
RUN npm install

CMD ["npm","start"]
