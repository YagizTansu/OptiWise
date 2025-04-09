// Insider and Institutional Ownership types
export interface InsiderHolder {
  maxAge: number;
  name: string;
  relation: string;
  url: string;
  transactionDescription: string;
  latestTransDate: Date;
  positionDirect: number;
  positionDirectDate: Date;
}

export interface InsiderTransaction {
  [x: string]: any;
  maxAge: number;
  shares: number;
  value: number;
  filerUrl: string;
  transactionText: string;
  filerName: string;
  filerRelation: string;
  moneyText: string;
  startDate: Date;
  ownership: string;
}

export interface InstitutionalOwner {
  maxAge: number;
  reportDate: Date;
  organization: string;
  pctHeld: number;
  position: number;
  value: number;
}

export interface InsiderOwnershipData {
  insiderHolders: InsiderHolder[];
  insiderTransactions: InsiderTransaction[];
  institutionalOwners: InstitutionalOwner[];
  error: string | null;
  currency: string;
}
