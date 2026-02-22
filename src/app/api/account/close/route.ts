import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { error: updateError } = await admin
      .from("profiles")
      .update({ user_id: null })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Close account: unlink profile failed", updateError);
      return NextResponse.json({ error: "Failed to close account" }, { status: 500 });
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Close account: deleteUser failed", deleteError);
      return NextResponse.json({ error: "Failed to close account" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Close account error", err);
    return NextResponse.json({ error: "Failed to close account" }, { status: 500 });
  }
}
