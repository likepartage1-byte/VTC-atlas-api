import { Share, Alert, NativeModules, Platform } from 'react-native';

const { InvoiceModule } = NativeModules;

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  tripNumber: string;
  issuedAt: string;
  passengerName: string;
  driverName: string;
  tripAmount: number;
  atlasCommission: number;
  netEarnings: number;
  currency: string;
}

class InvoiceService {
  private mockInvoices: Record<string, InvoiceDetail> = {
    'inv-001': {
      id: 'inv-001',
      invoiceNumber: 'INV-2026-001',
      tripNumber: 'AT-4582',
      issuedAt: '14/07/2026',
      passengerName: '••••••••',
      driverName: 'Khalid',
      tripAmount: 75.00,
      atlasCommission: 10.00,
      netEarnings: 65.00,
      currency: 'MAD',
    },
    'inv-002': {
      id: 'inv-002',
      invoiceNumber: 'INV-2026-002',
      tripNumber: 'AT-8910',
      issuedAt: '12/07/2026',
      passengerName: '••••••••',
      driverName: 'Khalid',
      tripAmount: 120.00,
      atlasCommission: 15.00,
      netEarnings: 105.00,
      currency: 'MAD',
    },
    'inv-003': {
      id: 'inv-003',
      invoiceNumber: 'INV-2026-003',
      tripNumber: 'AT-1122',
      issuedAt: '10/07/2026',
      passengerName: '••••••••',
      driverName: 'Khalid',
      tripAmount: 50.00,
      atlasCommission: 6.00,
      netEarnings: 44.00,
      currency: 'MAD',
    },
  };

  /** Fetch details of a single invoice */
  async getInvoice(invoiceId: string): Promise<InvoiceDetail> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const key = invoiceId.includes('2026-07') || invoiceId.includes('001') ? 'inv-001' :
                invoiceId.includes('2026-06') || invoiceId.includes('002') ? 'inv-002' : 'inv-003';

    return this.mockInvoices[key] || this.mockInvoices['inv-001'];
  }

  /** Generate and save PDF locally to public Downloads using Native Android Canvas PDF writer */
  async downloadInvoice(invoiceId: string): Promise<boolean> {
    const details = await this.getInvoice(invoiceId);
    if (Platform.OS === 'android' && InvoiceModule) {
      await InvoiceModule.generateInvoicePdf(details);
      return true;
    } else {
      // Mock delay on iOS/unsupported platforms
      await new Promise((resolve) => setTimeout(resolve, 800));
      return true;
    }
  }

  /** Share the generated PDF directly using native platform Share actions */
  async shareInvoice(invoiceId: string): Promise<void> {
    const details = await this.getInvoice(invoiceId);
    if (Platform.OS === 'android' && InvoiceModule) {
      await InvoiceModule.shareInvoice(details);
    } else {
      // Fallback share on iOS
      const message = `Facture Atlas No: ${details.invoiceNumber}`;
      await Share.share({
        message,
        title: `Facture ${details.invoiceNumber}`,
      });
    }
  }
}

export const invoiceService = new InvoiceService();
