import { getTeacherUsers } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, User, GraduationCap } from "lucide-react";

export default async function TeachersContactPage() {
  const teachers = await getTeacherUsers();
  const activeTeachers = teachers.filter(t => t.status === 'active');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Directory</h1>
        <p className="text-muted-foreground mt-2">
          Contact information and details for all teaching staff
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeTeachers.map((teacher, index) => (
          <Card key={`${teacher.name}-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {teacher.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{teacher.name}</CardTitle>
              <CardDescription className="text-sm">
                {teacher.role} - {teacher.class}
              </CardDescription>
              <Badge variant="default" className="bg-green-600 mt-2">
                {teacher.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {teacher.class && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.class}</span>
                </div>
              )}
              {teacher.username && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ID: {teacher.username}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activeTeachers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active teachers found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}