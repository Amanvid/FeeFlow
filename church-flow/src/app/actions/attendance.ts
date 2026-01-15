'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addAttendance(prevState: any, formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    const eventIdRaw = formData.get("eventId") as string;
    const eventId = eventIdRaw === "none" ? "" : eventIdRaw;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string; // present/absent

    if (!memberId || !date) {
      return { message: "Missing required fields", success: false };
    }

    const id = randomUUID();
    await googleSheetsService.appendToSheet("attendance", [
      [id, memberId, eventId || "", date, status || "present"],
    ]);

    revalidatePath("/dashboard/attendance");
    return { message: "Attendance recorded", success: true };
  } catch (error) {
    console.error("Failed to add attendance:", error);
    return { message: "Failed to add attendance", success: false };
  }
}

export async function updateAttendance(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const memberId = formData.get("memberId") as string;
    const eventId = formData.get("eventId") as string;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string;

    if (!id) {
      return { message: "Missing attendance ID", success: false };
    }

    const result = await googleSheetsService.getSheetData("attendance!A:A");
    const data = result.success ? result.data : [];
    const rowIndex = data?.findIndex((row: any) => row[0] === id);

    if (rowIndex !== undefined && rowIndex !== -1) {
      const rowNum = rowIndex + 1;
      const eventIdRaw = formData.get("eventId") as string;
      const eventId = eventIdRaw === "none" ? "" : eventIdRaw;
      await googleSheetsService.updateSheet(`attendance`, `B${rowNum}:E${rowNum}`, [[memberId, eventId || "", date, status || "present"]]);
      revalidatePath("/dashboard/attendance");
      return { message: "Attendance updated", success: true };
    } else {
      return { message: "Attendance not found", success: false };
    }
  } catch (error) {
    console.error("Failed to update attendance:", error);
    return { message: "Failed to update attendance", success: false };
  }
}
