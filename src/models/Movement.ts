export interface Movement {
  movementId: string;
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  timestamp: string;
  notes?: string;
}
