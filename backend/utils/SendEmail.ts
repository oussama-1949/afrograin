import { env } from '../config/env'
import { logger } from './Logger'
import { IOrder } from '../types'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// ─── Send via Resend API ───────────────────────────────────────────────────────
const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn('Email not configured — skipping email send')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      logger.error('Email send failed', error)
    } else {
      logger.info(`Email sent to ${options.to}`)
    }
  } catch (err) {
    logger.error('Email service error', err)
  }
}

// ─── Order confirmation email ─────────────────────────────────────────────────
export const sendOrderConfirmation = async (
  order: IOrder,
  userEmail: string,
  userName: string
): Promise<void> => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity} ${item.unit}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.price} MAD</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.subtotal} MAD</td>
      </tr>`
    )
    .join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#2d6a4f">Afrograin — Confirmation de commande</h2>
      <p>Bonjour <strong>${userName}</strong>,</p>
      <p>Votre commande <strong>${order.orderNumber}</strong> a été reçue avec succès.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Produit</th>
            <th style="padding:8px;text-align:center">Quantité</th>
            <th style="padding:8px;text-align:right">Prix unitaire</th>
            <th style="padding:8px;text-align:right">Sous-total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <table style="width:100%;margin-top:10px">
        <tr>
          <td style="padding:4px"><strong>Livraison:</strong></td>
          <td style="text-align:right">${order.shippingPrice === 0 ? 'Gratuite' : `${order.shippingPrice} MAD`}</td>
        </tr>
        <tr>
          <td style="padding:4px"><strong>Total:</strong></td>
          <td style="text-align:right"><strong>${order.grandTotal} MAD</strong></td>
        </tr>
        <tr>
          <td style="padding:4px"><strong>Paiement:</strong></td>
          <td style="text-align:right">Paiement à la livraison (COD)</td>
        </tr>
      </table>

      <div style="margin-top:20px;padding:15px;background:#f9f9f9;border-radius:8px">
        <h4 style="margin:0 0 8px">Adresse de livraison</h4>
        <p style="margin:0">${order.shippingAddress.fullName}</p>
        <p style="margin:0">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        <p style="margin:0">${order.shippingAddress.phone}</p>
      </div>

      <p style="margin-top:20px;color:#666;font-size:13px">
        Notre équipe vous contactera pour confirmer la livraison.<br/>
        Merci de faire confiance à Afrograin !
      </p>
    </div>
  `

  await sendEmail({
    to: userEmail,
    subject: `Commande confirmée — ${order.orderNumber}`,
    html,
  })
}

// ─── Order status update email ────────────────────────────────────────────────
export const sendOrderStatusUpdate = async (
  order: IOrder,
  userEmail: string,
  userName: string
): Promise<void> => {
  const statusLabels: Record<string, string> = {
    confirmed:  'Confirmée',
    shipped:    'En cours de livraison',
    delivered:  'Livrée',
    cancelled:  'Annulée',
  }

  const label = statusLabels[order.status] || order.status

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#2d6a4f">Afrograin — Mise à jour de commande</h2>
      <p>Bonjour <strong>${userName}</strong>,</p>
      <p>Votre commande <strong>${order.orderNumber}</strong> est maintenant : <strong>${label}</strong></p>
      ${order.cancelReason ? `<p>Raison : ${order.cancelReason}</p>` : ''}
      <p style="color:#666;font-size:13px">Merci de faire confiance à Afrograin !</p>
    </div>
  `

  await sendEmail({
    to: userEmail,
    subject: `Commande ${order.orderNumber} — ${label}`,
    html,
  })
}