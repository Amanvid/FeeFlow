'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addRecord(prevState: any, formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const amountStr = formData.get("amount") as string;
    const recordedBy = formData.get("recorded_by") as string;
    const date = formData.get("date") as string;

    if (!type || !amountStr || !date) {
      return { message: "Missing required fields", success: false };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      return { message: "Amount must be a number", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("financial_records", [
      [id, type, category || "", amount, recordedBy || "", date],
    ]);

    revalidatePath("/dashboard/finance");
    return { message: "Record added successfully", success: true };
  } catch (error) {
    console.error("Failed to add record:", error);
    return { message: "Failed to add record", success: false };
  }
}

export async function updateRecord(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const amountStr = formData.get("amount") as string;
    const recordedBy = formData.get("recorded_by") as string;
    const date = formData.get("date") as string;

    if (!id) {
      return { message: "Missing record ID", success: false };
    }

    const amount = parseFloat(amountStr || "");
    if (amountStr && isNaN(amount)) {
      return { message: "Amount must be a number", success: false };
    }

    const data = await googleSheetsService.getSheetData("financial_records!A:A");
    const rowIndex = data?.findIndex((row) => row[0] === id);

    if (rowIndex !== undefined && rowIndex !== -1) {
      const rowNum = rowIndex + 1;
      await googleSheetsService.updateSheet(
        `financial_records!B${rowNum}:F${rowNum}`,
        [[type, category || "", amount, recordedBy || "", date]]
      );

      revalidatePath("/dashboard/finance");
      return { message: "Record updated successfully", success: true };
    } else {
      return { message: "Record not found", success: false };
    }
  } catch (error) {
    console.error("Failed to update record:", error);
    return { message: "Failed to update record", success: false };
  }
}

