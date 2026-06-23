import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, trustProxy: true }),
  );

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const isProduction = configService.get('NODE_ENV') === 'production';

  app.useLogger(logger);

  // ── Security headers ────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
          },
        }
      : false,
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    crossOriginEmbedderPolicy: false, // allow iyzico iframe
  });

  // ── CORS ────────────────────────────────────────────────────────────────
  const allowedOrigins = (configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000'))
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new AuditInterceptor(app.get(DataSource)),
  );

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Koli API')
      .setDescription('Şehir ve Firma Rehberi API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`API running on http://0.0.0.0:${port} [${configService.get('NODE_ENV', 'development')}]`);
}

bootstrap();
