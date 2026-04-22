FROM --platform=linux/amd64 node:20

# Working dir
WORKDIR /app

# Install deps (prod-only; adjust if your build needs dev deps)
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Copy source
COPY . .

# Non-root user (Debian tools)
RUN groupadd -g 1001 nodejs \
 && useradd -u 1001 -g nodejs -m nodejs \
 && chown -R nodejs:nodejs /app
USER nodejs

# App port + healthcheck (aligns with ECS target group on 8000)
ENV PORT=8000
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get(`http://localhost:${process.env.PORT||8000}/health`,r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start
CMD ["npm","start"]
