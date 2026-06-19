import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BillingInvoice, PaymentStatus, PaymentProvider } from './entities/billing-invoice.entity';
import { IyzicoProvider } from './providers/iyzico.provider';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(BillingInvoice) private invoicesRepo: Repository<BillingInvoice>,
    private dataSource: DataSource,
    private iyzico: IyzicoProvider,
    private config: ConfigService,
  ) {}

  // ──── Initiate upgrade checkout ───────────────────────────────────────────

  async initUpgrade(params: {
    userId: string;
    businessId: string;
    planId: string;
    planName: string;
    amountCents: number;
    userEmail: string;
    userName: string;
    ip: string;
  }) {
    const siteUrl = this.config.get('SITE_URL', 'https://koli.app');
    const callbackUrl = `${siteUrl}/panel/uyelik/callback`;

    // Create pending invoice first
    const invoice = await this.invoicesRepo.save(
      this.invoicesRepo.create({
        userId: params.userId,
        businessId: params.businessId,
        planId: params.planId,
        provider: PaymentProvider.IYZICO,
        amountCents: params.amountCents,
        currency: 'TRY',
        status: PaymentStatus.PENDING,
        periodStart: new Date().toISOString().substring(0, 10),
        periodEnd: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      }),
    );

    const [firstName, ...rest] = (params.userName || 'User Name').split(' ');
    const lastName = rest.join(' ') || 'User';

    const result = await this.iyzico.initCheckoutForm({
      price: (params.amountCents / 100).toFixed(2),
      paidPrice: (params.amountCents / 100).toFixed(2),
      currency: 'TRY',
      basketId: invoice.id,
      callbackUrl,
      buyer: {
        id: params.userId,
        name: firstName,
        surname: lastName,
        email: params.userEmail,
        identityNumber: '11111111110', // placeholder — real apps collect this
        ip: params.ip,
        city: 'Istanbul',
        country: 'Turkey',
        registrationAddress: 'N/A',
      },
      billingAddress: {
        contactName: params.userName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'N/A',
      },
      basketItems: [
        {
          id: params.planId,
          name: `${params.planName} Üyelik Paketi`,
          category1: 'Üyelik',
          itemType: 'VIRTUAL',
          price: (params.amountCents / 100).toFixed(2),
        },
      ],
    });

    if (result.status === 'failure') {
      await this.invoicesRepo.update(invoice.id, {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        failureReason: result.errorMessage,
      });
      throw new BadRequestException(result.errorMessage ?? 'Payment initialization failed');
    }

    await this.invoicesRepo.update(invoice.id, { providerOrderId: result.paymentId });

    return {
      invoiceId: invoice.id,
      htmlContent: result.htmlContent, // iyzico 3DS form HTML
      paymentToken: result.paymentId,
    };
  }

  // ──── Callback / webhook processing ──────────────────────────────────────

  async handleIyzicoCallback(token: string): Promise<{ success: boolean; invoiceId?: string }> {
    const result = await this.iyzico.retrievePayment(token);

    const invoice = await this.invoicesRepo.findOne({ where: { providerOrderId: token } });
    if (!invoice) {
      this.logger.warn(`Invoice not found for token ${token}`);
      return { success: false };
    }

    if (result.status === 'success') {
      await this.activateSubscription(invoice.id, result.paymentId!);
      return { success: true, invoiceId: invoice.id };
    } else {
      await this.invoicesRepo.update(invoice.id, {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        failureReason: result.errorMessage,
      });
      return { success: false };
    }
  }

  async activateSubscription(invoiceId: string, providerPaymentId: string): Promise<void> {
    const invoice = await this.invoicesRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === PaymentStatus.PAID) return; // idempotent

    await this.dataSource.transaction(async (manager) => {
      // Mark invoice as paid
      await manager.query(
        `UPDATE billing_invoices SET status = 'paid', provider_payment_id = $1, paid_at = NOW() WHERE id = $2`,
        [providerPaymentId, invoiceId],
      );

      // Upgrade or create subscription
      const existing = await manager.query(
        `SELECT id FROM membership_subscriptions WHERE business_id = $1 AND status = 'active'`,
        [invoice.businessId],
      );

      const endDate = invoice.periodEnd ?? new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

      if (existing.length > 0) {
        await manager.query(
          `UPDATE membership_subscriptions SET plan_id = $1, ends_at = $2, updated_at = NOW() WHERE id = $3`,
          [invoice.planId, endDate, existing[0].id],
        );
      } else {
        await manager.query(
          `INSERT INTO membership_subscriptions (business_id, plan_id, status, starts_at, ends_at)
           VALUES ($1, $2, 'active', $3, $4)`,
          [invoice.businessId, invoice.planId, invoice.periodStart, endDate],
        );
      }
    });
  }

  // ──── Manual upgrade (admin) ──────────────────────────────────────────────

  async manualUpgrade(businessId: string, planId: string, adminUserId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const invoice = await this.invoicesRepo.save(
        this.invoicesRepo.create({
          userId: adminUserId,
          businessId,
          planId,
          provider: PaymentProvider.MANUAL,
          amountCents: 0,
          currency: 'TRY',
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          periodStart: new Date().toISOString().substring(0, 10),
          periodEnd: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10),
        }),
      );
      await this.activateSubscription(invoice.id, 'manual');
    });
  }

  // ──── Listing ─────────────────────────────────────────────────────────────

  async myInvoices(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.invoicesRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async allInvoices(page = 1, limit = 20) {
    const [data, total] = await this.invoicesRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }
}
