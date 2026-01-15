'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addTithe(prevState: any, formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    const amountStr = formData.get("amount") as string;
    const date = formData.get("date") as string;
    const recordedBy = formData.get("recorded_by") as string;
    const note = formData.get("note") as string;

    if (!memberId || !amountStr || !date) {
      return { message: "Missing required fields", success: false };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      return { message: "Amount must be a number", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("tithes", [
      [id, memberId, amount, date, recordedBy || "", note || ""],
    ]);

    revalidatePath("/dashboard/tithes");
    return { message: "Tithe recorded successfully", success: true };
  } catch (error) {
    console.error("Failed to add tithe:", error);
    return { message: "Failed to add tithe", success: false };
  }
}

export async function updateTithe(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const memberId = formData.get("memberId") as string;
    const amountStr = formData.get("amount") as string;
    const date = formData.get("date") as string;
    const recordedBy = formData.get("recorded_by") as string;
    const note = formData.get("note") as string;

    if (!id) {
      return { message: "Missing tithe ID", success: false };
    }

    const amount = parseFloat(amountStr || "");
    if (amountStr && isNaN(amount)) {
      return { message: "Amount must be a number", success: false };
    }

    const data = await googleSheetsService.getSheetData("tithes!A:A");
    const rowIndex = data?.findIndex((row) => row[0] === id);

    if (rowIndex !== undefined && rowIndex !== -1) {
      const rowNum = rowIndex + 1;
      await googleSheetsService.updateSheet(`tithes!B${rowNum}:F${rowNum}`, [
        [memberId, amount, date, recordedBy || "", note || ""],
      ]);
      revalidatePath("/dashboard/tithes");
      return { message: "Tithe updated successfully", success: true };
    } else {
      return { message: "Tithe not found", success: false };
    }
  } catch (error) {
    console.error("Failed to update tithe:", error);
    return { message: "Failed to update tithe", success: false };
  }
}

