'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addBirthday(prevState: any, formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    const date = formData.get("date") as string;
    const remarks = formData.get("remarks") as string;

    if (!memberId || !date) {
      return { message: "Missing required fields", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("birthdays", [
      [id, memberId, date, remarks || ""],
    ]);

    revalidatePath("/dashboard/weddings-birthdays");
    return { message: "Birthday recorded", success: true };
  } catch (error) {
    console.error("Failed to add birthday:", error);
    return { message: "Failed to add birthday", success: false };
  }
}

