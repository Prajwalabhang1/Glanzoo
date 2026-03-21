# --- Phase 1: Runner ---
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates wget && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd  --system --uid 1001 --gid nodejs nextjs

# Copy standalone output and static/public folders from the HOST
# Note: Ensure 'npm run build' was run locally before building this image
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs scripts ./scripts
COPY --chown=nextjs:nodejs prisma ./prisma

# Fix line endings and permissions for scripts
RUN sed -i 's/\r$//' scripts/* && chmod +x scripts/*

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh && \
    sed -i 's/\r$//' docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
