import { NextResponse } from "next/server";

type HospitalSummary = {
  id: string;
  name: string;
  address: string;
  city: string;
  lga?: string;
  state: string;
  phone: string;
  specialty: string[];
  ownership: "public" | "private";
  rating?: number | null;
};

type ShareEmailBody = {
  recipientEmail?: string;
  subject?: string;
  message?: string;
  hospitals?: HospitalSummary[];
  shareLink?: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        {
          error:
            "Email sharing is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as ShareEmailBody;
    const recipientEmail = body.recipientEmail?.trim();
    const subject = body.subject?.trim() || "Carefinder hospital list";
    const message = body.message?.trim();
    const hospitals = Array.isArray(body.hospitals) ? body.hospitals : [];
    const shareLink = body.shareLink?.trim();

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required." },
        { status: 400 },
      );
    }

    if (hospitals.length === 0) {
      return NextResponse.json(
        { error: "Select at least one hospital to share." },
        { status: 400 },
      );
    }

    const hospitalList = hospitals
      .map(
        (hospital, index) => `
          <li style="margin-bottom:16px;">
            <strong>${index + 1}. ${hospital.name}</strong><br />
            <span>${hospital.address}, ${hospital.city}, ${hospital.lga || ""} ${hospital.state}</span><br />
            <span>Phone: ${hospital.phone}</span><br />
            <span>Specialties: ${hospital.specialty.join(", ") || "N/A"}</span><br />
            <span>Rating: ${hospital.rating ?? "—"}</span>
          </li>
        `,
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1 style="color: #1d4ed8;">Carefinder Hospital List</h1>
        ${message ? `<p>${message}</p>` : ""}
        ${
          shareLink
            ? `<p><a href="${shareLink}" target="_blank" rel="noreferrer">Open the shared search</a></p>`
            : ""
        }
        <ul style="padding-left: 18px;">${hospitalList}</ul>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const result = (await response.json()) as
      | { id?: string; error?: { message?: string } }
      | undefined;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            result?.error?.message || "Failed to send email with Resend.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, id: result?.id });
  } catch (error) {
    console.error("share-email error", error);
    return NextResponse.json(
      { error: "Unexpected error while sending email." },
      { status: 500 },
    );
  }
}
