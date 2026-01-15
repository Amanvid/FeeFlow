'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addPayroll(prevState: any, formData: FormData) {
  try {
    const staffId = formData.get("staff_id") as string;
    const salaryStr = formData.get("salary") as string;
    const allowancesStr = formData.get("allowances") as string;
    const deductionsStr = formData.get("deductions") as string;
    const bonusStr = formData.get("bonus") as string;
    const month = formData.get("month") as string;
    const paidDate = formData.get("paid_date") as string;

    if (!staffId || !salaryStr || !month) {
      return { message: "Missing required fields", success: false };
    }

    const toNum = (s?: string) => {
      const n = parseFloat(s || "0");
      return isNaN(n) ? 0 : n;
    };

    const id = randomUUID();
    await googleSheetsService.appendToSheet("payroll", [
      [id, staffId, toNum(salaryStr), toNum(allowancesStr), toNum(deductionsStr), toNum(bonusStr), month, paidDate || ""],
    ]);

    revalidatePath("/dashboard/payroll");
    return { message: "Payroll added", success: true };
  } catch (error) {
    console.error("Failed to add payroll:", error);
    return { message: "Failed to add payroll", success: false };
  }
}

