'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addStaff(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const position = formData.get("position") as string;
    const startDate = formData.get("start_date") as string;
    const status = formData.get("status") as string;

    if (!name || !position) {
      return { message: "Missing required fields", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("staff", [
      [id, name, email || "", phone || "", position, startDate || "", status || "active"],
    ]);

    revalidatePath("/dashboard/staff");
    return { message: "Staff added", success: true };
  } catch (error) {
    console.error("Failed to add staff:", error);
    return { message: "Failed to add staff", success: false };
  }
}

export async function updateStaff(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const position = formData.get("position") as string;
    const startDate = formData.get("start_date") as string;
    const status = formData.get("status") as string;

    if (!id) {
      return { message: "Missing staff ID", success: false };
    }

    const data = await googleSheetsService.getSheetData("staff!A:A");
    const rowIndex = data?.findIndex((row) => row[0] === id);

    if (rowIndex !== undefined && rowIndex !== -1) {
      const rowNum = rowIndex + 1;
      await googleSheetsService.updateSheet(`staff!B${rowNum}:G${rowNum}`, [
        [name, email || "", phone || "", position, startDate || "", status || "active"],
      ]);
      revalidatePath("/dashboard/staff");
      return { message: "Staff updated", success: true };
    } else {
      return { message: "Staff not found", success: false };
    }
  } catch (error) {
    console.error("Failed to update staff:", error);
    return { message: "Failed to update staff", success: false };
  }
}

