import { ApiResponse } from '../domain/entities/wallet.types';

export interface BankConfig {
  id: string;
  name: string;
  brandColor: string;
  beneficiary: string;
  iban: string;
  rib: string;
  swift: string;
}

export interface AgencyConfig {
  id: string;
  name: string;
  brandColor: string;
  beneficiary: string;
  clientNumber: string;
}

export interface CmiConfig {
  merchantId: string;
  securedMessage: string;
  allowRechargeAmount: number;
}

export interface PaymentRechargeConfig {
  banks: BankConfig[];
  agencies: AgencyConfig[];
  cmi: CmiConfig;
  warningNotice: string;
  agencyNotice: string;
  quickAmounts: number[];
  minAmount: number;
  maxAmount: number;
}

export class PaymentService {
  /**
   * Fetches payment recharge configurations dynamically.
   * Checks locale parameter to simulate backend-localized content response.
   */
  async fetchRechargeConfig(locale = 'fr'): Promise<ApiResponse<PaymentRechargeConfig>> {
    return new Promise((resolve) => {
      const isAr = locale === 'ar';
      
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            banks: [
              {
                id: 'attijari',
                name: 'Attijariwafa Bank',
                brandColor: '#D97706',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA45 3500 0000 0012 3456 7890',
                rib: '3500 0000 0012 3456 7890 123',
                swift: 'ATLASMAM1XXX',
              },
              {
                id: 'popular',
                name: isAr ? 'البنك الشعبي' : 'Banque Populaire',
                brandColor: '#047857',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA21 2100 1234 5678 9012 3456',
                rib: '2100 1234 5678 9012 3456 789',
                swift: 'BCPAMM1XXX',
              },
              {
                id: 'boa',
                name: isAr ? 'بنك إفريقيا' : 'Bank Of Africa',
                brandColor: '#1D4ED8',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA02 0200 8765 4321 0987 6543',
                rib: '0200 8765 4321 0987 6543 210',
                swift: 'BMCEAMM1XXX',
              },
              {
                id: 'cih',
                name: 'CIH Bank',
                brandColor: '#EA580C',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA89 2300 9999 8888 7777 6666',
                rib: '2300 9999 8888 7777 6666 555',
                swift: 'CIHAMM1XXX',
              },
              {
                id: 'cdm',
                name: isAr ? 'مصرف المغرب' : 'Crédit du Maroc',
                brandColor: '#0F766E',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA15 1500 5555 4444 3333 2222',
                rib: '1500 5555 4444 3333 2222 111',
                swift: 'CDMAMM1XXX',
              },
              {
                id: 'sg',
                name: isAr ? 'الشركة العامة للبنك' : 'Société Générale Maroc',
                brandColor: '#DC2626',
                beneficiary: 'Atlas Mobility SARL',
                iban: 'MA67 2200 1111 2222 3333 4444',
                rib: '2200 1111 2222 3333 4444 555',
                swift: 'SGEAMM1XXX',
              },
            ],
            agencies: [
              {
                id: 'cashplus',
                name: 'Cash Plus',
                brandColor: '#EA580C',
                beneficiary: 'Atlas Mobility SARL',
                clientNumber: 'ATLAS-45874',
              },
              {
                id: 'wafacash',
                name: 'Wafacash',
                brandColor: '#D97706',
                beneficiary: 'Atlas Mobility SARL',
                clientNumber: 'ATLAS-45874',
              },
            ],
            cmi: {
              merchantId: 'ATLAS-MOB-2026',
              securedMessage: isAr 
                ? 'جميع المعاملات المالية محمية ومعالجة بالكامل عبر منصة CMI المغربية باتصال وخوادم آمنة SSL 256.'
                : 'Toutes les transactions sont protégées par le système CMI avec chiffrement SSL 256 bits.',
              allowRechargeAmount: 250.00,
            },
            warningNotice: isAr
              ? 'احفظ إيصال التحويل. بعد الدفع، أرسل لنا الإثبات وعبر لوحة التحكم أو الواتساب حتى يتم تفويض رصيدك سريعًا.'
              : 'Conservez votre reçu de virement. Après le paiement, envoyez-nous la preuve afin que votre solde soit crédité rapidement.',
            agencyNotice: isAr
              ? 'قدّم هذا الرقم التعريفي للوكالة المعتمدة واحتفظ بإيصال الدفع النقدي.'
              : 'Présentez ce numéro à l\'agence et conservez votre reçu.',
            quickAmounts: [50, 100, 150],
            minAmount: 50,
            maxAmount: 1000,
          },
        });
      }, 200);
    });
  }
}
