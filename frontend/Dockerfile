FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://165.101.18.101:8001/api

RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
