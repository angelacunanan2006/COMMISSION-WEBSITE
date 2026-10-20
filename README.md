# School Commission booking page

This is a static, Vercel-ready booking page. It needs no build step or environment variables.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Deploy to Vercel

1. Create a new Vercel project.
2. Import this folder or connect its Git repository.
3. Keep the framework preset as **Other**.
4. Deploy with no build command and no output directory.

The form saves booking requests to Supabase and sends a notification email with Resend. The Facebook links point to `https://www.facebook.com/schoolcommision1`.

## Connect bookings and notifications

1. Create a Supabase project and run `supabase-schema.sql` in the Supabase SQL Editor.
2. Create a Resend account and verify the sending domain used by `RESEND_FROM_EMAIL`.
3. Add the variables from `.env.example` to the Vercel project settings. Keep `SUPABASE_SERVICE_ROLE_KEY` private.
4. Redeploy the Vercel project. New bookings will appear in the Supabase `bookings` table and arrive at `NOTIFICATION_EMAIL`.

The local static preview cannot process `/api/bookings` until the project is deployed to Vercel with these variables configured.

The form records whether the client prefers GCash QR PH or a debit/credit card. To collect real payment online, add your GCash QR image or connect a PayMongo/Stripe payment link after you provide the account details. No payment credentials are included in the site.

When a client selects `Fully paid`, the form shows a download button for an HTML invoice containing the client name, task, quantity, price per task, total, and invoice number. Until a payment gateway webhook is connected, the paid status is client-reported and should be confirmed against your GCash or card account before accepting the invoice as proof of payment.

After a booking, clients also get a direct Messenger button for questions. Automatic messages sent directly into a Facebook Page inbox require a Meta app, Page access token, and approved permissions; the current flow avoids exposing those credentials and opens the correct Messenger conversation instead.