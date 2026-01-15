'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addEvent(prevState: any, formData: FormData) {
    try {
        const title = formData.get("title") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const departmentId = formData.get("departmentId") as string;
        const eventType = formData.get("eventType") as string;
        
        if (!title || !startDate) {
            return { message: "Title and start date are required", success: false };
        }

        const id = randomUUID();
        // Schema: ['id', 'title', 'start_date', 'end_date', 'department_id', 'event_type']
        await googleSheetsService.appendToSheet("events", [
            [id, title, startDate, endDate || "", departmentId || "", eventType || "General"]
        ]);

        revalidatePath("/dashboard/events");
        return { message: "Event added successfully", success: true };
    } catch (error) {
        console.error("Failed to add event:", error);
        return { message: "Failed to add event", success: false };
    }
}

export async function updateEvent(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const departmentId = formData.get("departmentId") as string;
        const eventType = formData.get("eventType") as string;

        if (!id) {
             return { message: "Missing event ID", success: false };
        }

        const data = await googleSheetsService.getSheetData("events!A:A");
        const rowIndex = data?.findIndex(row => row[0] === id);
        
        if (rowIndex !== undefined && rowIndex !== -1) {
            const rowNum = rowIndex + 1;
            // Update title(B), start_date(C), end_date(D), department_id(E), event_type(F)
            await googleSheetsService.updateSheet(`events!B${rowNum}:F${rowNum}`, [[title, startDate, endDate || "", departmentId || "", eventType || "General"]]);
            
            revalidatePath("/dashboard/events");
            return { message: "Event updated successfully", success: true };
        } else {
            return { message: "Event not found", success: false };
        }

    } catch (error) {
        console.error("Failed to update event:", error);
        return { message: "Failed to update event", success: false };
    }
}
