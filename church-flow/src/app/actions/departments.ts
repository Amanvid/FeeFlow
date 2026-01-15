'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addDepartment(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const leaderId = formData.get("leaderId") as string;
        
        if (!name) {
            return { message: "Department name is required", success: false };
        }

        const id = randomUUID();
        // Schema: ['id', 'name', 'leader_id', 'description']
        await googleSheetsService.appendToSheet("departments", [
            [id, name, leaderId || "", description || ""]
        ]);

        revalidatePath("/dashboard/departments");
        return { message: "Department added successfully", success: true };
    } catch (error) {
        console.error("Failed to add department:", error);
        return { message: "Failed to add department", success: false };
    }
}

export async function updateDepartment(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const leaderId = formData.get("leaderId") as string;

        if (!id) {
             return { message: "Missing department ID", success: false };
        }

        const data = await googleSheetsService.getSheetData("departments!A:A");
        const rowIndex = data?.findIndex(row => row[0] === id);
        
        if (rowIndex !== undefined && rowIndex !== -1) {
            const rowNum = rowIndex + 1;
            // Update name(B), leader_id(C), description(D)
            await googleSheetsService.updateSheet(`departments!B${rowNum}:D${rowNum}`, [[name, leaderId || "", description || ""]]);
            
            revalidatePath("/dashboard/departments");
            return { message: "Department updated successfully", success: true };
        } else {
            return { message: "Department not found", success: false };
        }

    } catch (error) {
        console.error("Failed to update department:", error);
        return { message: "Failed to update department", success: false };
    }
}
