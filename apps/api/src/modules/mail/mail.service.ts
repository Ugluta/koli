import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly siteUrl: string;
  private readonly fromName = 'Koli';

  constructor(
    private mailer: MailerService,
    private config: ConfigService,
  ) {
    this.siteUrl = config.get('SITE_URL', 'https://koli.app');
  }

  async sendWelcome(to: string, name: string) {
    await this.send(to, 'Koli\'ye Hoş Geldiniz 🎉', 'welcome', {
      name: name || to.split('@')[0],
      panelUrl: `${this.siteUrl}/panel`,
    });
  }

  async sendBusinessPending(to: string, ownerName: string, businessName: string) {
    await this.send(to, `"${businessName}" firmanız incelemede`, 'business-pending', {
      ownerName: ownerName || to.split('@')[0],
      businessName,
    });
  }

  async sendBusinessApproved(to: string, ownerName: string | undefined, businessName: string | undefined, businessSlug: string, cityName?: string) {
    await this.send(to, `"${businessName ?? ''}" firmanız onaylandı ✓`, 'business-approved', {
      ownerName: ownerName || to.split('@')[0],
      businessName,
      cityName: cityName ?? '',
      businessUrl: `${this.siteUrl}/firma/${businessSlug}`,
    });
  }

  private async send(to: string, subject: string, template: string, context: Record<string, any>) {
    try {
      await this.mailer.sendMail({ to, subject, template, context });
    } catch (err: any) {
      this.logger.warn(`Mail send failed [${template}] to ${to}: ${err.message}`);
    }
  }
}
