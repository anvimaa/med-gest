# Use the official Bun image
FROM oven/bun:latest AS runtime

# Set the working directory
WORKDIR /app

# Copy the requested files and folders
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
COPY build ./build

# Install production dependencies
RUN bun install --production

# Generate Prisma Client (using a dummy DATABASE_URL as it's required by the config but not needed for generation)
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" bun prisma generate

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Run the application (and push database schema if needed)
CMD bun prisma db push && bun build/index.js
