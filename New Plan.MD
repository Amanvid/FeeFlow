Phase 1: Teacher Access Restriction
1. Verify Teacher's Assigned Class :
   
   - I will modify the API endpoint at src/app/api/teacher/students/[className]/route.ts .
   - When a teacher requests to see a class list, this endpoint will first check the teacher's session to identify who is logged in.
   - It will then cross-reference the "Teachers" sheet in your Google Sheets database to find which class(es) that teacher is assigned to.
   - If the requested class does not match the teacher's assigned class, the request will be denied with an "Unauthorized" error.
2. Update the UI to Handle Access Denial :
   
   - I will create a new, reusable notification banner component using your existing UI elements from src/components/ui to ensure a consistent look and feel.
   - I will then modify the frontend page at src/app/teacher/students/[className]/page.tsx .
   - If the API denies access, the page will render this banner, displaying a clear message like: "Access Denied: You do not have permission to view this class." This will appear prominently on the page instead of a generic error. Phase 2: Admin Impersonation Feature
1. Bypass Teacher-Specific Checks for Admins :
   - I will update the same API endpoint ( src/app/api/teacher/students/[className]/route.ts ).
   - The logic will be modified to first check if the logged-in user has an "admin" role.
   - If the user is an admin, the class assignment check will be skipped, granting them immediate access to view the data for any class. This effectively allows them to see exactly what a class teacher would see.