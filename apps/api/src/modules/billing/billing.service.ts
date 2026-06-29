import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BillingInvoice, PaymentStatus, PaymentProvider } from './entities/billing-invoice.entity';
import { IyzicoProvider } from './providers/iyzico.provider';
import { MembershipPlan, MembershipPlanName } from '../membership/entities/membership-plan.entity';
import { BillingCycle, BILLING_CYCLE_DAYS } from '../../common/enums/billing-cycle.enum';

const CYCLE_LABEL: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: 'Aylık',
  [BillingCycle.YEARLY]: 'Yıllık',
  [BillingCycle.ONE_TIME]: 'Tek Ödeme (Ömür Boyu)',
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(BillingInvoice) private invoicesRepo: Repository<BillingInvoice>,
    @InjectRepository(MembershipPlan) private plansRepo: Repository<MembershipPlan>,
    private dataSource: DataSource,
    private iyzico: IyzicoProvider,
    private config: ConfigService,
  ) {}

  /** Server-authoritative price (in TRY) for a plan + cycle. Never trusts the client. */
  private priceForCycle(plan: MembershipPlan, cycle: BillingCycle): number {
    const raw =
      cycle === BillingCycle.MONTHLY ? plan.priceMonthly :
      cycle === BillingCycle.YEARLY ? plan.priceYearly :
      plan.priceOnetime;
    // numeric columns come back as strings from pg
    return Number(raw) || 0;
  }

  /** Period end date (YYYY-MM-DD) for a cycle, or null for lifetime/one-time. */
  private periodEndFor(cycle: BillingCycle): string | null {
    const days = BILLING_CYCLE_DAYS[cycle];
    if (days === null) return null;
    return new Date(Date.now() + days * 86400000).toISOString().substring(0, 10);
  }

  // ──── Initiate upgrade checkout ───────────────────────────────────────────

  async initUpgrade(params: {
    userId: string;
    businessId: string;
    planId: number;
    cycle: BillingCycle;
    userEmail: string;
    userName: string;
    ip: string;
  }) {
    const plan = await this.plansRepo.findOne({ where: { id: params.planId } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');
    if (plan.name === MembershipPlanName.FREE) {
      throw new BadRequestException('Ücretsiz plan için ödeme alınmaz.');
    }

    // Price is derived on the server from the plan — the client cannot influence it.
    const price = this.priceForCycle(plan, params.cycle);
    if (price <= 0) {
      throw new BadRequestException('Bu plan bu ödeme periyodu için satışta değil.');
    }
    const amountCents = Math.round(price * 100);
    const priceStr = price.toFixed(2);

    const siteUrl = this.config.get('SITE_URL', 'https://koli.app');
    const callbackUrl = `${siteUrl}/panel/uyelik/callback`;
    const periodStart = new Date().toISOString().substring(0, 10);
    const periodEnd = this.periodEndFor(params.cycle);

    // Create pending invoice first
    const invoice = await this.invoicesRepo.save(
      this.invoicesRepo.create({
        userId: params.userId,
        businessId: params.businessId,
        planId: String(plan.id),
        provider: PaymentProvider.IYZICO,
        amountCents,
        billingCycle: params.cycle,
        currency: 'TRY',
        status: PaymentStatus.PENDING,
        periodStart,
        periodEnd,
      }),
    );

    const [firstName, ...rest] = (params.userName || 'User Name').split(' ');
    const lastName = rest.join(' ') || 'User';

    const result = await this.iyzico.initCheckoutForm({
      price: priceStr,
      paidPrice: priceStr,
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
          id: String(plan.id),
          name: `${plan.displayName} — ${CYCLE_LABEL[params.cycle]}`,
          category1: 'Üyelik',
          itemType: 'VIRTUAL',
          price: priceStr,
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

      // Upsert subscription (business_id is unique). expires_at NULL => lifetime.
      await manager.query(
        `INSERT INTO membership_subscriptions (business_id, plan_id, status, billing_cycle, started_at, expires_at)
         VALUES ($1, $2, 'active', $3, NOW(), $4)
         ON CONFLICT (business_id) DO UPDATE
           SET plan_id = EXCLUDED.plan_id,
               status = 'active',
               billing_cycle = EXCLUDED.billing_cycle,
               expires_at = EXCLUDED.expires_at,
               cancelled_at = NULL`,
        [invoice.businessId, invoice.planId, invoice.billingCycle, invoice.periodEnd],
      );
    });
  }

  // ──── Manual upgrade (admin) ──────────────────────────────────────────────

  async manualUpgrade(businessId: string, planId: number, adminUserId: string): Promise<void> {
    const plan = await this.plansRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Create as PENDING so activateSubscription (idempotent on PAID) actually runs.
    const invoice = await this.invoicesRepo.save(
      this.invoicesRepo.create({
        userId: adminUserId,
        businessId,
        planId: String(plan.id),
        provider: PaymentProvider.MANUAL,
        amountCents: 0,
        billingCycle: BillingCycle.YEARLY,
        currency: 'TRY',
        status: PaymentStatus.PENDING,
        periodStart: new Date().toISOString().substring(0, 10),
        periodEnd: this.periodEndFor(BillingCycle.YEARLY),
      }),
    );
    await this.activateSubscription(invoice.id, 'manual');
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
