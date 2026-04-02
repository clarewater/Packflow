export interface PackingItem {
  id: string;
  name: string;
  note?: string;
  category: string;
  quantity: number;
  isRequired: boolean;
  isPacked: boolean;
}

export interface PackingScenario {
  id: string;
  name: string;
  description: string;
  items: PackingItem[];
}
