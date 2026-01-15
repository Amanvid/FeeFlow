'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addAsset(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const purchaseDate = formData.get("purchase_date") as string;
    const costStr = formData.get("cost") as string;
    const status = formData.get("status") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;

    if (!name || !category) {
      return { message: "Missing required fields", success: false };
    }

    const id = randomUUID();
    const cost = parseFloat(costStr || "0");
    await googleSheetsService.appendToSheet("assets", [
      [id, name, category, purchaseDate || "", cost, status || "active", location || "", notes || ""],
    ]);

    revalidatePath("/dashboard/assets");
    return { message: "Asset added", success: true };
  } catch (error) {
    console.error("Failed to add asset:", error);
    return { message: "Failed to add asset", success: false };
  }
}

