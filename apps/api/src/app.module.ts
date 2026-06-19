import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { GeographyModule } from './modules/geography/geography.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { ProductsModule } from './modules/products/products.module';
import { ServicesModule } from './modules/services/services.module';
import { MembershipModule } from './modules/membership/membership.module';
import { MediaModule } from './modules/media/media.module';
import { PanelModule } from './modules/panel/panel.module';
import { PostsModule } from './modules/posts/posts.module';
import { SeoModule } from './modules/seo/seo.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { AdsModule } from './modules/ads/ads.module';
import { BillingModule } from './modules/billing/billing.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      { name: 'burst',  ttl: 1000,   limit: 20  },   // 20 req/s burst
      { name: 'medium', ttl: 60000,  limit: 200 },   // 200 req/min
      { name: 'daily',  ttl: 86400000, limit: 5000 }, // 5k req/day per IP
    ]),
    AuthModule,
    HealthModule,
    GeographyModule,
    CategoriesModule,
    BusinessesModule,
    ProductsModule,
    ServicesModule,
    MembershipModule,
    MediaModule,
    PanelModule,
    PostsModule,
    SeoModule,
    ScraperModule,
    AdsModule,
    BillingModule,
    SearchModule,
    AdminModule,
  ],
})
export class AppModule {}
