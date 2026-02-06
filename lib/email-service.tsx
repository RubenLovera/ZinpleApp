import { Resend } from "resend"

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
}

// Función principal para enviar emails
export async function sendEmail(data: EmailData) {
  try {
    const result = await resend.emails.send({
      from: "ZinpleApp <info@zinpleapp.com>",
      to: data.to,
      subject: data.subject,
      html: data.html,
    })

    console.log("Email sent successfully:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Template para email de bienvenida (registro)
export function getWelcomeEmailTemplate(userName: string, userEmail: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a ZinpleApp!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #5B38B5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .welcome-box { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #5B38B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .feature { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a ZinpleApp!</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0;">Tu cuenta ha sido creada exitosamente</p>
        </div>
        
        <div class="content">
          <div class="welcome-box">
            <h2 style="color: #0ea5e9; margin: 0 0 10px 0;">¡Hola ${userName}!</h2>
            <p style="margin: 0; color: #475569;">Tu cuenta en ZinpleApp ha sido creada exitosamente. Ahora puedes cambiar tus dólares Zelle por USDT o Bolívares de forma rápida y segura.</p>
          </div>

          <h3 style="color: #1e293b;">¿Qué puedes hacer ahora?</h3>
          
          <div class="feature">
            <div class="feature-icon">✓</div>
            <div>
              <strong>Cambiar Zelle por USDT</strong><br>
              <span style="color: #64748b;">Recibe USDT en la red Polygon al instante</span>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">✓</div>
            <div>
              <strong>Cambiar Zelle por Bolívares</strong><br>
              <span style="color: #64748b;">Recibe bolívares vía Pagomóvil inmediatamente</span>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">✓</div>
            <div>
              <strong>Límites progresivos</strong><br>
              <span style="color: #64748b;">Tus límites aumentan con cada operación exitosa</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://zinpleapp.com" class="button">Crear mi primera operación</a>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>💡 Tip:</strong> Tu primera operación tiene un límite de $10 USD por seguridad. Este límite aumentará automáticamente con operaciones exitosas.</p>
          </div>
        </div>

        <div class="footer">
          <p>¿Necesitas ayuda? Contáctanos por WhatsApp: <a href="https://wa.me/56956413113" style="color: #5B38B5;">+56 9 5641 3113</a></p>
          <p>© 2024 ZinpleApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para email de operación creada
export function getOperationCreatedEmailTemplate(
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  isThirdPartyPayment: boolean,
  thirdPartyName?: string,
) {
  const currencyDisplay = currency === "usdt" ? "USDT" : "VES"
  const paymentType = isThirdPartyPayment ? `${thirdPartyName} realizará el pago` : "Tú realizarás el pago"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Operación Creada - ${operationId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .operation-box { background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 12px; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #059669; margin: 10px 0; }
        .operation-id { background-color: #1f2937; color: white; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-weight: bold; display: inline-block; margin: 10px 0; }
        .steps { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .step { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #fbbf24; }
        .step:last-child { border-bottom: none; }
        .step-number { background-color: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; }
        .button { display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .warning { background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0; color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Operación Creada!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Tu operación está lista para procesar</p>
        </div>
        
        <div class="content">
          <div class="operation-box">
            <h2 style="color: #059669; margin: 0 0 10px 0;">Detalles de tu Operación</h2>
            <div class="operation-id">${operationId}</div>
            <div class="amount">$${amount.toFixed(2)} USD → ${result.toFixed(2)} ${currencyDisplay}</div>
            <p style="color: #065f46; margin: 10px 0 0 0;">${paymentType}</p>
          </div>

          <div class="steps">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">📋 Próximos pasos:</h3>
            
            <div class="step">
              <span class="step-number">1</span>
              <strong>Realiza el pago por Zelle</strong><br>
              <span style="color: #92400e;">Envía $${amount.toFixed(2)} USD a: sonderenter@gmail.com</span>
            </div>
            
            <div class="step">
              <span class="step-number">2</span>
              <strong>Guarda el comprobante</strong><br>
              <span style="color: #92400e;">Toma captura de pantalla del comprobante de Zelle</span>
            </div>
            
            <div class="step">
              <span class="step-number">3</span>
              <strong>Envía por WhatsApp</strong><br>
              <span style="color: #92400e;">Contacta con nosotros y envía el comprobante</span>
            </div>
            
            <div class="step">
              <span class="step-number">4</span>
              <strong>Recibe tus fondos</strong><br>
              <span style="color: #92400e;">Recibirás tus ${currencyDisplay} inmediatamente</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://wa.me/56956413113?text=Hola!%20Tengo%20el%20comprobante%20de%20la%20operación%20${operationId}" class="button">📱 Enviar Comprobante por WhatsApp</a>
          </div>

          <div class="warning">
            <p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
            <ul style="margin: 10px 0 0 20px; padding: 0;">
              <li>Tienes 30 minutos para completar el pago</li>
              <li>El monto debe ser exactamente $${amount.toFixed(2)} USD</li>
              <li>Guarda este ID de operación: <strong>${operationId}</strong></li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>¿Necesitas ayuda? Contáctanos por WhatsApp: <a href="https://wa.me/56956413113" style="color: #5B38B5;">+56 9 5641 3113</a></p>
          <p>© 2024 ZinpleApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para email de operación completada
export function getOperationCompletedEmailTemplate(
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  newLimit: number,
) {
  const currencyDisplay = currency === "usdt" ? "USDT" : "Bolívares"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Operación Completada! - ${operationId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .success-box { background-color: #f0fdf4; border: 2px solid #10b981; padding: 30px; margin: 20px 0; border-radius: 12px; text-align: center; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 15px 0; }
        .operation-id { background-color: #1f2937; color: white; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-weight: bold; display: inline-block; margin: 10px 0; }
        .limit-upgrade { background-color: #eff6ff; border: 2px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 12px; text-align: center; }
        .new-limit { font-size: 24px; font-weight: bold; color: #1d4ed8; margin: 10px 0; }
        .button { display: inline-block; background-color: #5B38B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .celebration { font-size: 48px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="celebration">🎉</div>
          <h1>¡Operación Completada!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Tus fondos han sido enviados exitosamente</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <h2 style="color: #059669; margin: 0 0 15px 0;">✅ ¡Transacción Exitosa!</h2>
            <div class="operation-id">${operationId}</div>
            <div class="amount">${result.toFixed(2)} ${currencyDisplay}</div>
            <p style="color: #065f46; margin: 0;">han sido enviados a tu cuenta</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">📊 Resumen de la operación:</h3>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Enviaste:</span>
              <span style="font-weight: bold;">$${amount.toFixed(2)} USD</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Recibiste:</span>
              <span style="font-weight: bold; color: #059669;">${result.toFixed(2)} ${currencyDisplay}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0;">
              <span style="color: #6b7280;">Estado:</span>
              <span style="color: #059669; font-weight: bold;">✅ Completada</span>
            </div>
          </div>

          ${
            newLimit > amount
              ? `
          <div class="limit-upgrade">
            <h3 style="color: #1d4ed8; margin: 0 0 10px 0;">🚀 ¡Tu límite ha aumentado!</h3>
            <div class="new-limit">Nuevo límite: $${newLimit.toFixed(0)} USD</div>
            <p style="color: #1e40af; margin: 10px 0 0 0;">Ahora puedes realizar operaciones por montos mayores</p>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://zinpleapp.com" class="button">Crear nueva operación</a>
          </div>

          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af;"><strong>💡 ¿Sabías que...?</strong> Cada operación exitosa aumenta tu límite, permitiéndote realizar transacciones por montos mayores en el futuro.</p>
          </div>
        </div>

        <div class="footer">
          <p>Gracias por confiar en ZinpleApp 💜</p>
          <p>¿Necesitas ayuda? Contáctanos por WhatsApp: <a href="https://wa.me/56956413113" style="color: #5B38B5;">+56 9 5641 3113</a></p>
          <p>© 2024 ZinpleApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para email de operación cancelada
export function getOperationCancelledEmailTemplate(
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  reason?: string,
) {
  const currencyDisplay = currency === "usdt" ? "USDT" : "VES"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Operación Cancelada - ${operationId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .cancelled-box { background-color: #fef2f2; border: 2px solid #ef4444; padding: 30px; margin: 20px 0; border-radius: 12px; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #dc2626; margin: 15px 0; }
        .operation-id { background-color: #1f2937; color: white; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-weight: bold; display: inline-block; margin: 10px 0; }
        .reason-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #5B38B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Operación Cancelada</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Tu operación ha sido cancelada</p>
        </div>
        
        <div class="content">
          <div class="cancelled-box">
            <h2 style="color: #dc2626; margin: 0 0 15px 0;">Operación Cancelada</h2>
            <div class="operation-id">${operationId}</div>
            <div class="amount">$${amount.toFixed(2)} USD → ${result.toFixed(2)} ${currencyDisplay}</div>
            <p style="color: #991b1b; margin: 0;">Esta operación ha sido cancelada por el administrador</p>
          </div>

          ${
            reason
              ? `
          <div class="reason-box">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">📝 Motivo de la cancelación:</h3>
            <p style="color: #92400e; margin: 0;">${reason}</p>
          </div>
          `
              : ""
          }

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">📊 Detalles de la operación cancelada:</h3>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Monto solicitado:</span>
              <span style="font-weight: bold;">$${amount.toFixed(2)} USD</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Resultado esperado:</span>
              <span style="font-weight: bold;">${result.toFixed(2)} ${currencyDisplay}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0;">
              <span style="color: #6b7280;">Estado:</span>
              <span style="color: #dc2626; font-weight: bold;">❌ Cancelada</span>
            </div>
          </div>

          <div class="info-box">
            <p style="margin: 0; color: #1e40af;"><strong>💡 ¿Qué puedes hacer ahora?</strong></p>
            <ul style="margin: 10px 0 0 20px; padding: 0; color: #1e40af;">
              <li>Crear una nueva operación con los datos correctos</li>
              <li>Contactarnos por WhatsApp si tienes dudas</li>
              <li>Revisar que todos los datos estén correctos antes de crear la operación</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://zinpleapp.com" class="button">Crear nueva operación</a>
          </div>
        </div>

        <div class="footer">
          <p>¿Necesitas ayuda? Contáctanos por WhatsApp: <a href="https://wa.me/56956413113" style="color: #5B38B5;">+56 9 5641 3113</a></p>
          <p>© 2024 ZinpleApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Funciones específicas para cada tipo de email
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const emailData: EmailData = {
    to: userEmail,
    subject: "¡Bienvenido a ZinpleApp! Tu cuenta ha sido creada",
    html: getWelcomeEmailTemplate(userName, userEmail),
  }

  return await sendEmail(emailData)
}

export async function sendOperationCreatedEmail(
  userEmail: string,
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  isThirdPartyPayment: boolean,
  thirdPartyName?: string,
) {
  const emailData: EmailData = {
    to: userEmail,
    subject: `Operación ${operationId} creada - Procede con el pago`,
    html: getOperationCreatedEmailTemplate(
      userName,
      operationId,
      amount,
      currency,
      result,
      isThirdPartyPayment,
      thirdPartyName,
    ),
  }

  return await sendEmail(emailData)
}

export async function sendOperationCompletedEmail(
  userEmail: string,
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  newLimit: number,
) {
  const emailData: EmailData = {
    to: userEmail,
    subject: `¡Operación ${operationId} completada! Fondos enviados`,
    html: getOperationCompletedEmailTemplate(userName, operationId, amount, currency, result, newLimit),
  }

  return await sendEmail(emailData)
}

export async function sendOperationCancelledEmail(
  userEmail: string,
  userName: string,
  operationId: string,
  amount: number,
  currency: string,
  result: number,
  reason?: string,
) {
  const emailData: EmailData = {
    to: userEmail,
    subject: `Operación ${operationId} cancelada`,
    html: getOperationCancelledEmailTemplate(userName, operationId, amount, currency, result, reason),
  }

  return await sendEmail(emailData)
}
