
export type Invoice = {
  id: string;
  amount: number;
  description: string;
  reference: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
};

export type MomoProvider = {
    code: 'MTN' | 'VODAFONE' | 'AIRTELTIGO';
    name: string;
};
