'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEvent } from "@/app/actions/events";

const useToast = () => {
    return {
        toast: (props: any) => {
            if (props.variant === "destructive") {
                alert(`Error: ${props.title} - ${props.description}`);
            } else {
                alert(`Success: ${props.title} - ${props.description}`);
            }
        }
    }
};

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    department_id: string;
    event_type: string;
  };
  departments: { id: string; name: string }[];
}

export function EditEventDialog({ event, departments }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setIsLoading(true);

    const formData = new FormData(eventForm.currentTarget);
    formData.append("id", event.id);
    
    const result = await updateEvent(null, formData);

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      // Adjust for timezone offset or use simple string manipulation if dateString is already ISO
      // Assuming dateString is ISO but maybe not full.
      // Simplest:
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0">
             <span className="sr-only">Edit</span>
             ✎
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update event details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={event.title}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={formatDate(event.start_date)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={formatDate(event.end_date)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventType" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select name="eventType" defaultValue={event.event_type}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentId" className="text-right">
                Dept
              </Label>
              <div className="col-span-3">
                <Select name="departmentId" defaultValue={event.department_id || "none"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select department (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (General)</SelectItem>
                        {departments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
