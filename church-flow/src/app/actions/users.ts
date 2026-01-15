'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addUser(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const status = formData.get("status") as string;
        
        if (!name || !email) {
            return { message: "Missing required fields", success: false };
        }

        const userId = randomUUID();
        const createdAt = new Date().toISOString();
        const defaultPassword = "password123";
        const phone = ""; // Optional for system users

        // Schema: ['id', 'name', 'email', 'phone', 'password', 'role', 'status', 'created_at']
        await googleSheetsService.appendToSheet("users", [
            [userId, name, email, phone, defaultPassword, role, status, createdAt]
        ]);

        revalidatePath("/dashboard/settings");
        return { message: "User added successfully", success: true };
    } catch (error) {
        console.error("Failed to add user:", error);
        return { message: "Failed to add user", success: false };
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    try {
        const userId = formData.get("userId") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const status = formData.get("status") as string;

        if (!userId) {
             return { message: "Missing user ID", success: false };
        }

        const usersData = await googleSheetsService.getSheetData("users!A:A");
        const userRowIndex = usersData?.findIndex(row => row[0] === userId);
        
        if (userRowIndex !== undefined && userRowIndex !== -1) {
            const rowNum = userRowIndex + 1;
            // Update name(B), email(C)
            await googleSheetsService.updateSheet(`users!B${rowNum}:C${rowNum}`, [[name, email]]);
            
            // Update role(F), status(G)
            await googleSheetsService.updateSheet(`users!F${rowNum}:G${rowNum}`, [[role, status]]);
            
            revalidatePath("/dashboard/settings");
            return { message: "User updated successfully", success: true };
        } else {
            return { message: "User not found", success: false };
        }

    } catch (error) {
        console.error("Failed to update user:", error);
        return { message: "Failed to update user", success: false };
    }
}
