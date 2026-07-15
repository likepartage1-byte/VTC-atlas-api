import {
  IWalletRepository,
} from '../../domain/repository/IWalletRepository';
import {
  WalletBalance,
  Transaction,
  PendingPayment,
  PaymentMethod,
  PaymentMethodType,
  ApiResponse,
} from '../../domain/entities/wallet.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Module-level persistent state for mock database simulation
const mockBalanceObj: WalletBalance = { amount: 39.84, currency: 'MAD', pending: 6.24 };

let mockTransactionsArr: Transaction[] = [
  {
    id: 'txn-001',
    type: 'vat',
    status: 'pending',
    amount: -1.04,
    currency: 'MAD',
    label: 'TVA',
    description: 'Taxe sur la valeur ajoutée',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  },
  {
    id: 'txn-002',
    type: 'service_fee',
    status: 'pending',
    amount: -5.20,
    currency: 'MAD',
    label: 'Paiement de service',
    description: 'Frais de service Atlas',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'txn-003',
    type: 'vat',
    status: 'completed',
    amount: -0.62,
    currency: 'MAD',
    label: 'TVA',
    description: 'Ville de Marrakech',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'txn-004',
    type: 'service_fee',
    status: 'completed',
    amount: -3.10,
    currency: 'MAD',
    label: 'Paiement de service',
    description: 'Course Ménara → Palmeraie',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'txn-005',
    type: 'recharge',
    status: 'completed',
    amount: 150.00,
    currency: 'MAD',
    label: 'Rechargement',
    description: 'Visa se terminant par 4242',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'txn-006',
    type: 'commission',
    status: 'completed',
    amount: -4.20,
    currency: 'MAD',
    label: 'Commission',
    description: 'Commission Atlas 10,4%',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
];

export class WalletMockRepository implements IWalletRepository {

  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    await delay(700);
    return {
      success: true,
      data: mockBalanceObj,
    };
  }

  async getTransactions(limit = 20): Promise<ApiResponse<Transaction[]>> {
    await delay(500);
    return { success: true, data: mockTransactionsArr.slice(0, limit) };
  }

  async getPendingPayments(): Promise<ApiResponse<PendingPayment[]>> {
    await delay(400);
    return {
      success: true,
      data: [
        {
          id: 'pnd-001',
          amount: 1.04,
          currency: 'MAD',
          reason: 'TVA sur course annulée',
          status: 'pending',
          estimatedProcessingAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
        {
          id: 'pnd-002',
          amount: 5.20,
          currency: 'MAD',
          reason: 'Paiement de service — vérification',
          status: 'pending',
          estimatedProcessingAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        },
      ],
    };
  }

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    await delay(300);
    return {
      success: true,
      data: [
        { id: 'pm-001', type: 'cash',     label: 'Espèces',         isDefault: true },
        { id: 'pm-002', type: 'visa',     label: 'Visa',            isDefault: false, last4: '4242' },
        { id: 'pm-003', type: 'mastercard', label: 'Mastercard',    isDefault: false, last4: '1234' },
      ],
    };
  }

  async recharge(
    method: PaymentMethodType,
    amount: number,
  ): Promise<ApiResponse<{ newBalance: number }>> {
    await delay(1200);
    if (amount < 10) {
      return { success: false, error: 'Montant minimum: 10 MAD', code: 422 };
    }

    const isPendingMethod = method === 'bank_transfer' || method === 'cash';

    if (isPendingMethod) {
      // Manual payment methods generate a pending state (admin approval required)
      mockBalanceObj.pending += amount;
    } else {
      // Electronic gateways are processed and approved instantly
      mockBalanceObj.amount += amount;
    }

    // Persist brand-new recharge transaction
    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      type: 'recharge',
      status: isPendingMethod ? 'pending' : 'completed',
      amount: amount,
      currency: 'MAD',
      label: method === 'bank_transfer'
        ? 'Recharge par Virement'
        : method === 'cash'
        ? 'Recharge par Agence Cash'
        : 'Recharge par Carte Bancaire',
      description: method === 'bank_transfer'
        ? 'Demande de validation de virement bancaire (En attente)'
        : method === 'cash'
        ? 'Versement d’espèces en agence (En attente)'
        : `Paiement simulé (${method.toUpperCase()}) via CMI Morocco`,
      createdAt: new Date(),
    };
    mockTransactionsArr = [newTx, ...mockTransactionsArr];

    return { success: true, data: { newBalance: mockBalanceObj.amount } };
  }
}
