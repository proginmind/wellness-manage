import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockMembers } from "@/lib/mock-data";
import { startOfMonth } from "date-fns";

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate stats from mock data
    // In the future, this will use Supabase queries
    const total = mockMembers.length;
    const active = mockMembers.length; // All mock members are active
    
    // Count members who joined this month
    const monthStart = startOfMonth(new Date());
    const newThisMonth = mockMembers.filter(
      (member) => member.dateJoined >= monthStart
    ).length;
    
    const archived = 0; // No archived members in mock data

    return NextResponse.json({
      total,
      active,
      newThisMonth,
      archived,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
