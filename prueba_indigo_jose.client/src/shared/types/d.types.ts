export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

export type Sale = {
  id?: number;
  date: string;
  clientIdentification: string;
  value: number;
  quantity: number;
  saleStatusId: number;
  items: SaleDetail[];
  client?: Client | null;
  saleStatus?: SaleStatus | null;
};

export type SaleDetail = {
  id?: number;
  productId?: number;
  product?: Product | null;
  unitPrice: number;
  quantity: number;
};

export type SaleStatus = {
  id: number;
  name: string;
};

export type Client = {
  identification: string;
  name?: string;
};
