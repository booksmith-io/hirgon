FROM node:22

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci --only=production
RUN npm install

# rebuild native modules for container's Node version
RUN npm rebuild better-sqlite3

# copy application
COPY . .

# install sqlite3 CLI for database patches
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# setup .hirgonrc if it doesn't already exist
RUN test -f /app/.hirgonrc || cp /app/.hirgonrc.example /app/.hirgonrc

# generate session secret for production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && \
    cp -a .hirgonrc.example .hirgonrc && \
    SECRET=$(openssl rand -hex 32) && \
    sed -i "s/\"production\": \"\"/\"production\": \"$SECRET\"/" .hirgonrc

# create db directory
RUN mkdir -p /app/db

# create logs directory
RUN mkdir -p /app/logs

# expose port
EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npx", "pm2-runtime", "start", "ecosystem.config.js"]
