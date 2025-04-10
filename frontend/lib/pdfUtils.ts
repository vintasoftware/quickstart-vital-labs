import { URL_PREFIX } from './client';

export const useLabResultsPDF = () => {
  const downloadPDF = async (orderId: string) => {
    try {
      const response = await fetch(`${URL_PREFIX}/orders/${orderId}/results/pdf/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      
      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 100);
      
      return true;
    } catch (err) {
      return false;
    }
  };

  return { downloadPDF };
};