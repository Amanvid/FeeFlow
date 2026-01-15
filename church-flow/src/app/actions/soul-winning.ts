'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addSoulWinning(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    const date = formData.get("date") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;
    const followUpStatus = formData.get("follow_up_status") as string;

    if (!memberId || !date) {
      return { message: "Missing required fields", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("soul_winning", [
      [id, memberId, date, location || "", notes || "", followUpStatus || "pending"],
    ]);

    revalidatePath("/dashboard/soul-winning");
    return { message: "Soul winning record added", success: true };
  } catch (error) {
    console.error("Failed to add soul winning record:", error);
    return { message: "Failed to add soul winning record", success: false };
  }
}

export async function updateSoulWinning(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const memberId = formData.get("memberId") as string;
    const date = formData.get("date") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;
    const followUpStatus = formData.get("follow_up_status") as string;

    if (!id) {
      return { message: "Missing record ID", success: false };
    }

    const data = await googleSheetsService.getSheetData("soul_winning!A:A");
    const rowIndex = data?.findIndex((row) => row[0] === id);

    if (rowIndex !== undefined && rowIndex !== -1) {
      const rowNum = rowIndex + 1;
      await googleSheetsService.updateSheet(`soul_winning!B${rowNum}:F${rowNum}`, [
        [memberId, date, location || "", notes || "", followUpStatus || "pending"],
      ]);
      revalidatePath("/dashboard/soul-winning");
      return { message: "Soul winning record updated", success: true };
    } else {
      return { message: "Record not found", success: false };
    }
  } catch (error) {
    console.error("Failed to update soul winning record:", error);
    return { message: "Failed to update soul winning record", success: false };
  }
}
