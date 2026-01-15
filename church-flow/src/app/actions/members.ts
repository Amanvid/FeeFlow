'use server'

import { googleSheetsService } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function addMember(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const status = formData.get("status") as string;
        const baptismStatus = formData.get("baptismStatus") as string;
        const dateJoined = formData.get("dateJoined") as string;
        
        // Basic validation
        if (!name || !email || !phone) {
            return { message: "Missing required fields", success: false };
        }

        const userId = randomUUID();
        const memberId = randomUUID();
        const createdAt = new Date().toISOString();
        const defaultPassword = "password123"; // In a real app, send invite email
        const role = "member";
        const userStatus = "active";
        const departmentId = ""; // Optional, handled separately or later

        // Add to users sheet
        // Schema: ['id', 'name', 'email', 'phone', 'password', 'role', 'status', 'created_at']
        await googleSheetsService.appendToSheet("users", [
            [userId, name, email, phone, defaultPassword, role, userStatus, createdAt]
        ]);

        // Add to members sheet
        // Schema: ['id', 'user_id', 'membership_status', 'date_joined', 'department_id', 'baptism_status']
        await googleSheetsService.appendToSheet("members", [
            [memberId, userId, status, dateJoined, departmentId, baptismStatus]
        ]);

        revalidatePath("/dashboard/members");
        
        return { message: "Member added successfully", success: true };
    } catch (error) {
        console.error("Failed to add member:", error);
        return { message: "Failed to add member", success: false };
    }
}

export async function updateMember(prevState: any, formData: FormData) {
    try {
        const memberId = formData.get("memberId") as string;
        const userId = formData.get("userId") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const status = formData.get("status") as string;
        const baptismStatus = formData.get("baptismStatus") as string;
        const dateJoined = formData.get("dateJoined") as string;

        if (!memberId || !userId) {
             return { message: "Missing member ID", success: false };
        }

        // 1. Update User Data (Name, Email, Phone)
        // Fetch users to find row
        const usersData = await googleSheetsService.getSheetData("users!A:A"); // Fetch IDs only for speed? No, need row index.
        // Actually A:A gives IDs.
        const userRowIndex = usersData?.findIndex(row => row[0] === userId);
        
        if (userRowIndex !== undefined && userRowIndex !== -1) {
            // Row number = index + 1. 
            // users schema: id, name, email, phone, password, role, status, created_at
            // We want to update name(B), email(C), phone(D)
            const rowNum = userRowIndex + 1;
            await googleSheetsService.updateSheet(`users!B${rowNum}:D${rowNum}`, [[name, email, phone]]);
        } else {
             console.error(`User ID ${userId} not found`);
             // return { message: "User not found", success: false }; // Proceed?
        }

        // 2. Update Member Data (Status, Baptism, Date Joined)
        // Fetch members to find row
        const membersData = await googleSheetsService.getSheetData("members!A:A");
        const memberRowIndex = membersData?.findIndex(row => row[0] === memberId);

        if (memberRowIndex !== undefined && memberRowIndex !== -1) {
             // Row number = index + 1
             // members schema: id, user_id, membership_status, date_joined, department_id, baptism_status
             // We want to update membership_status(C), date_joined(D), skip E, baptism_status(F)
             // It's easier to just update C:F and keep E as is? 
             // We need to fetch the existing row to preserve department_id if we don't have it.
             // Or update cell by cell.
             // Let's update C${rowNum}:D${rowNum} and F${rowNum}
             
             const rowNum = memberRowIndex + 1;
             
             // Update status and date joined
             await googleSheetsService.updateSheet(`members!C${rowNum}:D${rowNum}`, [[status, dateJoined]]);
             
             // Update baptism status (Col F)
             await googleSheetsService.updateSheet(`members!F${rowNum}`, [[baptismStatus]]);
             
        } else {
            return { message: "Member record not found", success: false };
        }

        revalidatePath("/dashboard/members");
        return { message: "Member updated successfully", success: true };

    } catch (error) {
        console.error("Failed to update member:", error);
        return { message: "Failed to update member", success: false };
    }
}
