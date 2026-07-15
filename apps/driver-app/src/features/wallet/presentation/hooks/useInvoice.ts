import { useState, useCallback, useEffect } from 'react';
import { invoiceService, InvoiceDetail } from '../../services/invoice.service';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useInvoice = (invoiceId: string) => {
  const { t } = useTranslation('wallet');

  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  const download = useCallback(async () => {
    if (!invoice) return;
    try {
      setDownloading(true);
      const success = await invoiceService.downloadInvoice(invoice.id);
      if (success) {
        Alert.alert(
          t('success') || 'Success',
          `${t('invoice_download_success') || 'Invoice downloaded successfully.'} (${invoice.invoiceNumber})`
        );
      }
    } catch (err) {
      Alert.alert(t('error') || 'Error', 'Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  }, [invoice, t]);

  const share = useCallback(async () => {
    if (!invoice) return;
    await invoiceService.shareInvoice(invoice.id);
  }, [invoice]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return {
    loading,
    downloading,
    error,
    invoice,
    refresh: loadInvoice,
    download,
    share,
  };
};
