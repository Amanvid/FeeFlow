import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { googleSheetsService } from "@/lib/google-sheets";

export const revalidate = 0; // Disable caching to always get fresh data

async function getDashboardData() {
  try {
    const [membersData, financialData, eventsData, donationsData, usersData] = await Promise.all([
      googleSheetsService.getSheetData("members!A2:Z"),
      googleSheetsService.getSheetData("financial_records!A2:Z"),
      googleSheetsService.getSheetData("events!A2:Z"),
      googleSheetsService.getSheetData("donations!A2:Z"),
      googleSheetsService.getSheetData("users!A2:Z"),
    ]);

    // 1. Total Members
    const totalMembers = membersData ? membersData.length : 0;

    // 2. Total Income (Monthly)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Financial Records Schema: ['id', 'type', 'category', 'amount', 'recorded_by', 'date']
    // Index 1: type, Index 3: amount, Index 5: date
    const monthlyIncome = (financialData || [])
      .filter(record => {
        if (!record[5] || !record[1]) return false;
        const date = new Date(record[5]);
        return record[1] === 'Income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, record) => sum + (parseFloat(record[3]) || 0), 0);

    // 3. Upcoming Events (Next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Events Schema: ['id', 'title', 'start_date', 'end_date', 'department_id', 'event_type']
    // Index 2: start_date
    const upcomingEventsCount = (eventsData || []).filter(event => {
      if (!event[2]) return false;
      const startDate = new Date(event[2]);
      return startDate >= now && startDate <= nextWeek;
    }).length;

    // 4. Recent Transactions (Last 5 Donations)
    // Donations Schema: ['id', 'member_id', 'amount', 'method', 'purpose', 'date']
    // Users Schema: ['id', 'name', 'email', ...]
    
    // Create a map of user/member IDs to names/emails
    // Assuming members table links to users table via user_id, but donations has member_id.
    // Let's assume for simplicity we can get name from users if we have user_id, 
    // but here we have member_id.
    // Members: ['id', 'user_id', ...]
    
    const memberMap = new Map();
    if (membersData) {
        membersData.forEach(m => memberMap.set(m[0], m[1])); // id -> user_id
    }
    
    const userMap = new Map();
    if (usersData) {
        usersData.forEach(u => userMap.set(u[0], { name: u[1], email: u[2] })); // id -> {name, email}
    }

    const recentTransactions = (donationsData || [])
      .slice(-5)
      .reverse()
      .map(donation => {
        const memberId = donation[1];
        const userId = memberMap.get(memberId);
        const user = userId ? userMap.get(userId) : null;
        
        return {
          name: user ? user.name : 'Unknown Member',
          email: user ? user.email : 'No email',
          amount: parseFloat(donation[2]) || 0,
          date: donation[5]
        };
      });

    return {
      totalMembers,
      monthlyIncome,
      upcomingEventsCount,
      recentTransactions,
      attendance: 0 // Placeholder as we don't have attendance data yet
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalMembers: 0,
      monthlyIncome: 0,
      upcomingEventsCount: 0,
      recentTransactions: [],
      attendance: 0
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total registered members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Income (Monthly)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {data.monthlyIncome.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcomingEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.attendance}</div>
            <p className="text-xs text-muted-foreground">
              Last recorded service
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available for chart
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
                {data.recentTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent donations found.</p>
                ) : (
                    data.recentTransactions.map((tx, i) => (
                        <div key={i} className="flex items-center">
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{tx.name}</p>
                            <p className="text-sm text-muted-foreground">{tx.email}</p>
                          </div>
                          <div className="ml-auto font-medium">
                            +GHS {tx.amount.toFixed(2)}
                          </div>
                        </div>
                    ))
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
