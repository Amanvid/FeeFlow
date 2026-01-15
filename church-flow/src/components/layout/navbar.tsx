import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export const Navbar = () => {
  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        {/* User Button or Profile can go here */}
      </div>
    </div>
  );
};
