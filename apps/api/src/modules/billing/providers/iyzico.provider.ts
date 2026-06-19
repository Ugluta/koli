import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface IyzicoInitPaymentParams {
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    ip: string;
    city: string;
    country: string;
    registrationAddress: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: 'VIRTUAL';
    price: string;
  }>;
}

export interface IyzicoPaymentResult {
  status: 'success' | 'failure';
  paymentId?: string;
  conversationId?: string;
  errorMessage?: string;
  errorCode?: string;
  htmlContent?: string; // 3DS form
}

@Injectable()
export class IyzicoProvider {
  private readonly logger = new Logger(IyzicoProvider.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.apiKey = config.get('IYZICO_API_KEY', 'sandbox-api-key');
    this.secretKey = config.get('IYZICO_SECRET_KEY', 'sandbox-secret-key');
    this.baseUrl = config.get('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com');
  }

  async initCheckoutForm(params: IyzicoInitPaymentParams): Promise<IyzicoPaymentResult> {
    const conversationId = params.basketId;
    const body = {
      locale: 'tr',
      conversationId,
      ...params,
    };

    try {
      const res = await fetch(`${this.baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecommerce`, {
        method: 'POST',
        headers: this.buildHeaders('/payment/iyzipos/checkoutform/initialize/auth/ecommerce', body),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });

      const data = await res.json();

      if (data.status === 'success') {
        return {
          status: 'success',
          paymentId: data.token,
          conversationId,
          htmlContent: data.checkoutFormContent,
        };
      }

      return {
        status: 'failure',
        errorMessage: data.errorMessage ?? 'Payment initialization failed',
        errorCode: data.errorCode,
      };
    } catch (err: any) {
      this.logger.error(`Iyzico init error: ${err.message}`);
      return { status: 'failure', errorMessage: err.message };
    }
  }

  async retrievePayment(token: string): Promise<IyzicoPaymentResult> {
    const body = { locale: 'tr', conversationId: token, token };

    try {
      const res = await fetch(`${this.baseUrl}/payment/iyzipos/checkoutform/auth/ecommerce/detail`, {
        method: 'POST',
        headers: this.buildHeaders('/payment/iyzipos/checkoutform/auth/ecommerce/detail', body),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });

      const data = await res.json();

      if (data.status === 'success') {
        return { status: 'success', paymentId: data.paymentId, conversationId: data.conversationId };
      }
      return { status: 'failure', errorMessage: data.errorMessage, errorCode: data.errorCode };
    } catch (err: any) {
      this.logger.error(`Iyzico retrieve error: ${err.message}`);
      return { status: 'failure', errorMessage: err.message };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('base64');
    return expected === signature;
  }

  private buildHeaders(path: string, body: any): Record<string, string> {
    const randomStr = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString();
    const hash = this.generateHash(randomStr, body);
    return {
      'Content-Type': 'application/json',
      Authorization: `IYZWSv2 apiKey:${this.apiKey}, randomKey:${randomStr}, signature:${hash}, timestamp:${timestamp}`,
    };
  }

  private generateHash(randomStr: string, body: any): string {
    const str = `${this.apiKey}${randomStr}${this.secretKey}${JSON.stringify(body)}`;
    return crypto.createHash('sha256').update(str).digest('base64');
  }
}
