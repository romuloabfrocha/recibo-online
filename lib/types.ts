export type Profile = {
  id: string;
  company_name: string | null;
  cpf_cnpj: string | null;
  city: string | null;
  signature_url: string | null;
  logo_url: string | null;
};

export type Receipt = {
  id: string;
  user_id: string;
  number: number;
  year: number;
  client_name: string;
  client_cpf_cnpj: string | null;
  amount: number;
  description: string | null;
  payment_method: string | null;
  receipt_date: string;
  show_signature: boolean;
  created_at: string;
};

export function numeroRecibo(r: Pick<Receipt, "number" | "year">): string {
  return `${String(r.number).padStart(3, "0")}/${r.year}`;
}
