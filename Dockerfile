FROM node:24-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache curl python3 make g++

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 复制所有源码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# 使用单独的启动脚本避免语法问题
CMD ["sh", "-c", "echo 'Pushing database schema...' && npx prisma db push --schema=prisma/schema.postgres.prisma && echo 'Running seed data...' && npx tsx prisma/initdb.ts && echo 'Starting application...' && npm start"]

