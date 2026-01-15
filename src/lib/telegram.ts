import { formatCurrency, BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { BookingFull } from "@/types";

type BookingNotificationMeta = {
  source?: string;
};

const BOOKING_DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`
  : "https://futsal-gba.vercel.app/dashboard/bookings";

const getTelegramConfig = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const rawChatIds = process.env.TELEGRAM_CHAT_ID ?? "";
  const chatIds = rawChatIds
    .split(/[,\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    return null;
  }

  return { token, chatIds };
};

const formatJakartaDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const buildBookingMessage = (
  booking: BookingFull,
  meta?: BookingNotificationMeta
) => {
  const statusLabel = BOOKING_STATUS_LABELS[booking.status];
  const notes = booking.notes
    ? escapeHtml(booking.notes).replace(/\n/g, "<br>")
    : null;

  const lines: Array<string | null> = [
    "<b>📢 Booking Baru</b>",
    meta?.source ? `<i>Sumber: ${escapeHtml(meta.source)}</i>` : null,
    "",
    "<b>Detail Booking</b>",
    `• <b>Kode:</b> ${escapeHtml(booking.id.slice(-8).toUpperCase())}`,
    `• <b>Lapangan:</b> ${escapeHtml(booking.field.name)}`,
    `• <b>Tanggal:</b> ${escapeHtml(formatJakartaDate(booking.date))}`,
    `• <b>Waktu:</b> ${escapeHtml(booking.startTime)} - ${escapeHtml(
      booking.endTime
    )} (${booking.duration} jam)`,
    `• <b>Total:</b> ${escapeHtml(formatCurrency(booking.totalPrice))}`,
    `• <b>Status:</b> ${escapeHtml(statusLabel)}`,
    "",
    "<b>Pemesan</b>",
    `• <b>Nama:</b> ${escapeHtml(booking.customerName)}`,
    `• <b>Telepon:</b> ${escapeHtml(booking.customerPhone || "-")}`,
    notes ? `• <b>Catatan:</b> ${notes}` : null,
  ];

  return lines.filter((line) => line !== null && line !== undefined).join("\n");
};

export async function notifyNewBooking(
  booking: BookingFull,
  meta?: BookingNotificationMeta
): Promise<void> {
  const config = getTelegramConfig();
  if (!config) return;

  const message = buildBookingMessage(booking, meta);

  await Promise.allSettled(
    config.chatIds.map(async (chatId) => {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${config.token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Buka daftar booking",
                      url: BOOKING_DASHBOARD_URL,
                    },
                  ],
                ],
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Telegram notify failed:", errorText);
        }
      } catch (error) {
        console.error("Telegram notify error:", error);
      }
    })
  );
}
