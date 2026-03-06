"use server";

export type CoffeeChatFormPayload = {
  name: string;
  email: string;
  topic: string;
  person1?: string;
  person2?: string;
};

export async function sendCoffeeChatEmail(payload: CoffeeChatFormPayload): Promise<{ success: true }> {
  // モック実装: 受け取りデータをログ出力のみ
  console.log("Coffee Chat Form Received:", payload);
  return { success: true };
}

