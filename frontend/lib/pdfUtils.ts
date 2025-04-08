import useSWR from 'swr';

// Custom fetcher for PDF data
const pdfFetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch PDF');
  }
  
  return response.blob();
};

export const useLabResultsPDF = (orderId: string | null) => {
  const { data: pdfBlob, error, isLoading } = useSWR(
    orderId ? `/orders/${orderId}/results/pdf` : null,
    pdfFetcher
  );

  const downloadPDF = async () => {
    if (!pdfBlob) return;

    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lab-results-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return {
    downloadPDF,
    error,
    isLoading
  };
};