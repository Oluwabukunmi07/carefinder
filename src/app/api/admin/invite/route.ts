import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing Supabase credentials." },
        { status: 500 },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email } = (await req.json()) as { email?: string };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const { data, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email.trim(), {
        data: { role: "admin" },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/update-password`,
      });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({ id: data.user.id, role: "admin" });

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Invited but failed to set admin role: " + profileError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("invite error", error);
    return NextResponse.json(
      { error: "Unexpected error while sending invite." },
      { status: 500 },
    );
  }
}
