package com.example.seatbookingsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String to, String name, String eventName,
                                        String showDate, String showTime, String venue,
                                        String refCode, String seats, double amount) {
        String subject = "🎟 Booking Confirmed — " + eventName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#e05c2a;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Your ticket is confirmed!</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s 👋</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Your booking for <strong>%s</strong> has been confirmed.</p>
                <div style="background:#fff8f5;border:1.5px solid rgba(224,92,42,0.2);border-radius:10px;padding:20px;margin-bottom:24px">
                  <table style="width:100%%;border-collapse:collapse">
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#e05c2a">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">EVENT</td><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:1px solid #e6e2da">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">DATE</td><td style="padding:8px 0;font-size:14px;border-top:1px solid #e6e2da">%s at %s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">VENUE</td><td style="padding:8px 0;font-size:14px;border-top:1px solid #e6e2da">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">SEATS</td><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:1px solid #e6e2da">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">AMOUNT PAID</td><td style="padding:8px 0;font-size:16px;font-weight:700;color:#e05c2a;border-top:1px solid #e6e2da">₹%.2f</td></tr>
                  </table>
                </div>
                <p style="color:#9c8e82;font-size:12px;margin:0">Please carry this ref code to the venue. Enjoy the show! 🎉</p>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, eventName, refCode, eventName, showDate, showTime, venue, seats, amount);
        send(to, subject, html);
    }

    @Async
    public void sendPaymentConfirmation(String to, String name, String eventName,
                                        String txnRef, double amount, String method) {
        String subject = "💳 Payment Successful — " + eventName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#1a8f63;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Payment received successfully!</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s 👋</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Your payment for <strong>%s</strong> was successful.</p>
                <div style="background:#f0faf6;border:1.5px solid rgba(26,143,99,0.2);border-radius:10px;padding:20px">
                  <table style="width:100%%;border-collapse:collapse">
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">TRANSACTION REF</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#1a8f63">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">AMOUNT</td><td style="padding:8px 0;font-size:16px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">₹%.2f</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">METHOD</td><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:1px solid #e6e2da">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">STATUS</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">✅ SUCCESS</td></tr>
                  </table>
                </div>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, eventName, txnRef, amount, method);
        send(to, subject, html);
    }

    // ── User-initiated cancellation (80% refund, needs admin approval) ─────────
    @Async
    public void sendCancellationConfirmation(String to, String name, String eventName,
                                             String refCode, double refundAmount) {
        String subject = "❌ Booking Cancelled — " + eventName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#e8305a;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Booking Cancellation Confirmed</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Your booking for <strong>%s</strong> (Ref: <code>%s</code>) has been cancelled.</p>
                <div style="background:#fff5f7;border:1.5px solid rgba(232,48,90,0.2);border-radius:10px;padding:20px">
                  <p style="margin:0;font-size:14px;color:#18140f">💰 Refund of <strong>₹%.2f</strong> is pending admin approval and will be processed within 5–7 business days.</p>
                </div>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, eventName, refCode, refundAmount);
        send(to, subject, html);
    }

    // ── Organiser-initiated cancellation (100% refund, auto-processed) ─────────
    @Async
    public void sendOrganizerCancellationEmail(String to, String name, String eventName,
                                               String refCode, double refundAmount) {
        String subject = "🚫 Show Cancelled — " + eventName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#b91c1c;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Important: Show Cancellation Notice</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s,</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">
                  We regret to inform you that <strong>%s</strong> has been cancelled by the organiser.
                  Your booking (Ref: <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px">%s</code>) has been automatically cancelled.
                </p>
                <div style="background:#fff5f5;border:1.5px solid rgba(185,28,28,0.2);border-radius:10px;padding:20px;margin-bottom:20px">
                  <table style="width:100%%;border-collapse:collapse">
                    <tr>
                      <td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td>
                      <td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#b91c1c">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">REFUND AMOUNT</td>
                      <td style="padding:8px 0;font-size:16px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">₹%.2f (100%%)</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">REFUND STATUS</td>
                      <td style="padding:8px 0;font-size:14px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">✅ Automatically Processed</td>
                    </tr>
                  </table>
                </div>
                <div style="background:#f0faf6;border:1.5px solid rgba(26,143,99,0.25);border-radius:10px;padding:16px">
                  <p style="margin:0;font-size:14px;color:#18140f;font-weight:600">💰 Full Refund Guaranteed</p>
                  <p style="margin:8px 0 0;font-size:13px;color:#6b5e52">
                    Since this cancellation was initiated by the organiser, you are entitled to a <strong>100% full refund</strong>.
                    No admin approval is required — your refund has been automatically processed and will be
                    <strong>credited to your account within 5–7 business days</strong>.
                  </p>
                </div>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, eventName, refCode, refCode, refundAmount);
        send(to, subject, html);
    }

    @Async
    public void sendRefundStatusEmail(String to, String name, String eventName,
                                      String refCode, double refundAmount, boolean approved) {
        if (approved) {
            String subject = "✅ Refund Approved — " + eventName;
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
                  <div style="background:#1a8f63;padding:28px 32px">
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Refund Approved!</p>
                  </div>
                  <div style="padding:32px">
                    <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s 👋</h2>
                    <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Great news! Your refund for <strong>%s</strong> has been approved.</p>
                    <div style="background:#f0faf6;border:1.5px solid rgba(26,143,99,0.2);border-radius:10px;padding:20px">
                      <table style="width:100%%;border-collapse:collapse">
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#1a8f63">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">REFUND AMOUNT</td><td style="padding:8px 0;font-size:16px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">₹%.2f</td></tr>
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">STATUS</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">✅ APPROVED</td></tr>
                      </table>
                      <p style="margin:16px 0 0;font-size:13px;color:#6b5e52">Amount will be credited to your account within 5–7 business days.</p>
                    </div>
                  </div>
                  <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                    <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
                  </div>
                </div>
                """.formatted(name, eventName, refCode, refundAmount);
            send(to, subject, html);
        } else {
            String subject = "❌ Refund Rejected — " + eventName;
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
                  <div style="background:#e8305a;padding:28px 32px">
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Refund Request Rejected</p>
                  </div>
                  <div style="padding:32px">
                    <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s</h2>
                    <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">We're sorry. Your refund request for <strong>%s</strong> has been rejected.</p>
                    <div style="background:#fff5f7;border:1.5px solid rgba(232,48,90,0.2);border-radius:10px;padding:20px">
                      <table style="width:100%%;border-collapse:collapse">
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#e8305a">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">REFUND AMOUNT</td><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:1px solid #e6e2da">₹%.2f</td></tr>
                        <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">STATUS</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#e8305a;border-top:1px solid #e6e2da">❌ REJECTED</td></tr>
                      </table>
                      <p style="margin:16px 0 0;font-size:13px;color:#6b5e52">If you believe this is an error, please contact our support team.</p>
                    </div>
                  </div>
                  <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                    <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
                  </div>
                </div>
                """.formatted(name, eventName, refCode, refundAmount);
            send(to, subject, html);
        }
    }

    @Async
    public void sendRefundCreditedEmail(String to, String name, String eventName,
                                        String refCode, double refundAmount) {
        String subject = "💰 Refund Credited — " + eventName;
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#1a8f63;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Refund Successfully Credited!</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s 👋</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Your refund for <strong>%s</strong> has been credited to your account.</p>
                <div style="background:#f0faf6;border:1.5px solid rgba(26,143,99,0.2);border-radius:10px;padding:20px">
                  <table style="width:100%%;border-collapse:collapse">
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#1a8f63">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">AMOUNT CREDITED</td><td style="padding:8px 0;font-size:16px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">₹%.2f</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">STATUS</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1a8f63;border-top:1px solid #e6e2da">💰 CREDITED</td></tr>
                  </table>
                  <p style="margin:16px 0 0;font-size:13px;color:#6b5e52">The amount has been credited to your original payment method. Thank you for using ShowSpot!</p>
                </div>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, eventName, refCode, refundAmount);
        send(to, subject, html);
    }

    @Async
    public void sendLoyaltyOfferEmail(String to, String name, int bookingCount) {
        String subject = "🎉 You've unlocked 20% off your next booking!";
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:linear-gradient(135deg,#e05c2a,#c97d1a);padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot 🎉</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">You're a ShowSpot Star!</p>
              </div>
              <div style="padding:32px;text-align:center">
                <div style="font-size:64px;margin-bottom:16px">🌟</div>
                <h2 style="color:#18140f;font-size:22px;margin:0 0 12px">Congrats %s!</h2>
                <p style="color:#6b5e52;font-size:15px;margin:0 0 24px">You've made <strong>%d bookings</strong> this month and unlocked a special reward!</p>
                <div style="background:linear-gradient(135deg,#fff8f5,#fef2ea);border:2px dashed #e05c2a;border-radius:12px;padding:24px;margin-bottom:24px">
                  <div style="font-size:48px;font-weight:900;color:#e05c2a;letter-spacing:2px">20%% OFF</div>
                  <div style="color:#6b5e52;font-size:14px;margin-top:8px">on your next booking — applied automatically!</div>
                </div>
                <p style="color:#9c8e82;font-size:13px">The discount will be automatically applied at your next booking. No code needed!</p>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(name, bookingCount);
        send(to, subject, html);
    }

    @Async
    public void sendReminderEmail(String to, String name, String eventName,
                                  String showDate, String startTime, String venue,
                                  String refCode, String seats) {
        String subject = "⏰ Reminder: " + eventName + " starts in 1 hour!";
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#2563a8;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot ⏰</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Your show starts in 1 hour!</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s!</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">Don't forget — <strong>%s</strong> starts soon. Get ready!</p>
                <div style="background:#f0f5ff;border:1.5px solid rgba(37,99,168,0.2);border-radius:10px;padding:20px">
                  <table style="width:100%%;border-collapse:collapse">
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;width:40%%">REF CODE</td><td style="padding:8px 0;font-family:monospace;font-size:14px;font-weight:700;color:#2563a8">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">DATE</td><td style="padding:8px 0;font-size:14px;border-top:1px solid #e6e2da">%s at %s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">VENUE</td><td style="padding:8px 0;font-size:14px;border-top:1px solid #e6e2da">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#9c8e82;font-size:13px;font-weight:600;border-top:1px solid #e6e2da">SEATS</td><td style="padding:8px 0;font-size:14px;font-weight:700;border-top:1px solid #e6e2da">%s</td></tr>
                  </table>
                </div>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated reminder</p>
              </div>
            </div>
            """.formatted(name, eventName, refCode, showDate, startTime, venue, seats);
        send(to, subject, html);
    }

    @Async
    public void sendOtpEmail(String to, String userName, String otp) {
        String subject = "🔐 ShowSpot — Password Reset OTP";
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
              <div style="background:#e05c2a;padding:28px 32px">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Password Reset Request</p>
              </div>
              <div style="padding:32px">
                <h2 style="color:#18140f;font-size:20px;margin:0 0 6px">Hi %s 👋</h2>
                <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">We received a request to reset your password. Use the OTP below:</p>
                <div style="text-align:center;background:#fff8f5;border:2px dashed #e05c2a;border-radius:12px;padding:28px;margin-bottom:24px">
                  <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#e05c2a;font-family:monospace">%s</div>
                  <p style="color:#9c8e82;font-size:13px;margin:12px 0 0">Valid for <strong>10 minutes</strong> only</p>
                </div>
                <p style="color:#9c8e82;font-size:13px;margin:0">If you did not request this, please ignore this email. Your password will not be changed.</p>
              </div>
              <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
                <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
              </div>
            </div>
            """.formatted(userName, otp);
        send(to, subject, html);
    }

    // Alias for backward compatibility
    @Async
    public void sendCancellationEmail(String to, String name, String eventName,
                                      String refCode, double refundAmount) {
        sendCancellationConfirmation(to, name, eventName, refCode, refundAmount);
    }

    @Async
    public void sendReviewReminderEmail(String to, String name, String eventName, Long reservationId) {
        String subject = "⭐ How was " + eventName + "? Leave a review!";
        String html = """
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
          <div style="background:linear-gradient(135deg,#c97d1a,#e05c2a);padding:28px 32px">
            <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot ⭐</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Share your experience!</p>
          </div>
          <div style="padding:32px;text-align:center">
            <div style="font-size:56px;margin-bottom:16px">🎬</div>
            <h2 style="color:#18140f;font-size:20px;margin:0 0 12px">Hi %s, how was the show?</h2>
            <p style="color:#6b5e52;font-size:14px;margin:0 0 24px">
              We hope you enjoyed <strong>%s</strong>! Your review helps other ShowSpot users discover great events.
            </p>
            <div style="display:inline-flex;gap:8px;font-size:32px;margin-bottom:24px">
              ⭐⭐⭐⭐⭐
            </div>
            <p style="color:#9c8e82;font-size:13px;margin:0">
              Log in to ShowSpot → My Bookings → View Details → Leave a Review
            </p>
          </div>
          <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
            <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
          </div>
        </div>
        """.formatted(name, eventName);
        send(to, subject, html);
    }


    @Async
    public void sendReviewThankYouEmail(String to, String name, String eventName, int rating) {
        String stars   = "⭐".repeat(rating);
        String subject = "🙏 Thank you for reviewing " + eventName + "!";
        String html    = """
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e2da">
          <div style="background:linear-gradient(135deg,#c97d1a,#e05c2a);padding:28px 32px">
            <h1 style="color:white;margin:0;font-size:22px;font-weight:700">ShowSpot 🙏</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Thank you for your review!</p>
          </div>
          <div style="padding:32px;text-align:center">
            <div style="font-size:56px;margin-bottom:16px">%s</div>
            <h2 style="color:#18140f;font-size:20px;margin:0 0 10px">Thank you, %s!</h2>
            <p style="color:#6b5e52;font-size:15px;margin:0 0 24px">
              Your <strong>%d-star review</strong> for <strong>%s</strong> has been published.
            </p>
            <div style="background:#fffbf0;border:1.5px solid #c97d1a44;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="margin:0;color:#6b5e52;font-size:14px;line-height:1.6">
                Your review helps other ShowSpot users discover great events. We truly appreciate you taking the time to share your experience! 💛
              </p>
            </div>
            <p style="color:#9c8e82;font-size:13px">Keep exploring and booking amazing events on ShowSpot!</p>
          </div>
          <div style="background:#f9f6f1;padding:16px 32px;border-top:1px solid #e6e2da">
            <p style="color:#9c8e82;font-size:12px;margin:0;text-align:center">© 2026 ShowSpot · This is an automated email</p>
          </div>
        </div>
        """.formatted(stars, name, rating, eventName);
        send(to, subject, html);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            helper.setFrom("ShowSpot <admin4531@gmail.com>");
            mailSender.send(msg);
            log.info("Email sent to {} — {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}