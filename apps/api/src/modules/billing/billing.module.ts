import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { IyzicoProvider } from './providers/iyzico.provider';
import { BillingInvoice } from './entities/billing-invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingInvoice])],
  controllers: [BillingController],
  providers: [BillingService, IyzicoProvider],
  exports: [BillingService],
})
export class BillingModule {}
