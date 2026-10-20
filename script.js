const form = document.querySelector("#booking-form");
const successMessage = document.querySelector("#form-success");
const copyButton = document.querySelector("#copy-request");
const invoiceButton = document.querySelector("#download-invoice");
const messengerButton = document.querySelector("#message-after-booking");
const submitButton = form.querySelector('button[type="submit"]');
const bookingStatus = document.querySelector("#booking-status");
let bookingText = "";
let currentInvoice = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function downloadInvoice(invoice) {
  const total = invoice.quantity * invoice.unitPrice;
  const invoiceHtml = `<!doctype html><html><head><meta charset="UTF-8"><title>Invoice ${invoice.number}</title><style>body{font:16px Arial,sans-serif;max-width:760px;margin:48px auto;color:#111}header{display:flex;justify-content:space-between;border-bottom:3px solid #111;padding-bottom:18px}h1{margin:0;font-size:28px}small{color:#666}.paid{display:inline-block;padding:8px 12px;border:2px solid #111;font-weight:bold;margin:28px 0}.row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #ddd}.total{font-size:22px;font-weight:bold;border-bottom:0;margin-top:12px}.note{margin-top:45px;color:#666;font-size:13px}</style></head><body><header><div><h1>JA'S COMMISSION</h1><small>Professional services</small></div><div><strong>INVOICE</strong><br><small>${escapeHtml(invoice.number)}</small></div></header><span class="paid">PAID IN FULL</span><p><strong>Client</strong><br>${escapeHtml(invoice.name)}<br>${escapeHtml(invoice.email)}</p><div class="row"><strong>Task</strong><strong>Quantity</strong><strong>Price</strong><strong>Total</strong></div><div class="row"><span>${escapeHtml(invoice.task)}</span><span>${invoice.quantity}</span><span>₱${invoice.unitPrice.toFixed(2)}</span><span>₱${total.toFixed(2)}</span></div><div class="row total"><span>Total paid</span><span>₱${total.toFixed(2)}</span></div><p class="note">Thank you for working with Ja's Commission. This invoice confirms full payment for the task above.</p></body></html>`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([invoiceHtml], { type: "text/html" }));
  link.download = `invoice-${invoice.number}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "...";

  const booking = {
    name: data.get("name"),
    email: data.get("email"),
    service: data.get("service"),
    date: data.get("date"),
    details: data.get("details"),
    budget: data.get("budget"),
    payment_method: data.get("payment_method"),
    quantity: Number(data.get("quantity")),
    unit_price: Number(data.get("unit_price")),
    payment_status: data.get("payment_status"),
  };

  const details = [
    "BOOKING REQUEST - JA'S COMMISSION",
    "",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Service: ${data.get("service")}`,
    `Preferred delivery date: ${data.get("date")}`,
    `Estimated budget: ${data.get("budget")}`,
    `Payment method: ${data.get("payment_method")}`,
    `Quantity: ${data.get("quantity")}`,
    `Price per task: ₱${data.get("unit_price")}`,
    `Payment status: ${data.get("payment_status")}`,
    "",
    "Project details:",
    data.get("details"),
  ];
  bookingText = details.join("\n");

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not send booking.");
    }

    bookingStatus.textContent = result.notified
      ? "Your request was sent. We will contact you soon."
      : "Your request was saved. We will contact you soon.";
    successMessage.hidden = false;
    messengerButton.href = `https://m.me/schoolcommision1?ref=${encodeURIComponent(`booking-${booking.name}`)}`;
    currentInvoice = {
      number: `JC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Date.now()).slice(-4)}`,
      name: booking.name,
      email: booking.email,
      task: booking.service,
      quantity: booking.quantity,
      unitPrice: booking.unit_price,
    };
    invoiceButton.hidden = booking.payment_status !== "Fully paid";
    successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.reset();
  } catch (error) {
    bookingStatus.textContent = error.message;
    successMessage.hidden = false;
    successMessage.style.background = "#e8e8e8";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "↗";
  }
});

invoiceButton.addEventListener("click", () => {
  if (currentInvoice) downloadInvoice(currentInvoice);
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(bookingText);
  copyButton.textContent = "Copied to clipboard";
  setTimeout(() => { copyButton.textContent = "Copy booking details"; }, 2200);
});

const dateInput = form.querySelector('input[name="date"]');
dateInput.min = new Date().toISOString().split("T")[0];