# Sistema de Emails Transaccionales - Guía de Implementación

## Resumen Completado

Se ha implementado un sistema completo de emails transaccionales con Resend y React Email para Zinple.

## Componentes Creados

### 1. Templates de Email (8 en total)
- `WelcomeEmail.tsx` - Bienvenida a nuevos usuarios
- `OperationCreatedEmail.tsx` - Notificación cuando se crea una operación
- `OperationCompletedEmail.tsx` - Comprobante formal de operación completada
- `OperationCancelledEmail.tsx` - Notificación de cancelación
- `BeneficiaryAddedEmail.tsx` - Nuevo beneficiario agregado
- `NewSessionEmail.tsx` - Alerta de seguridad para nuevo login
- `AdminNewOperationEmail.tsx` - Notificación para admin (nueva operación)
- `AdminOperationCompletedEmail.tsx` - Notificación para admin (completada)

### 2. Componentes Reutilizables
- `EmailLayout.tsx` - Layout base con header/footer
- `EmailButton.tsx` - Botones con 3 variantes
- `ReceiptBox.tsx` - Cajas de recibo formales

### 3. Servicios Backend
- `/lib/email-sender.ts` - Lógica central con Resend (Server Action)
- `/lib/operation-emails.ts` - Helpers para operaciones específicas
- `/lib/email-webhooks.ts` - Listeners de cambios en Supabase
- `/app/api/emails/send` - API route POST para envío manual

### 4. Inicialización
- `/hooks/useEmailWebhooks.ts` - Hook para inicializar listeners
- `/components/EmailWebhooksInitializer.tsx` - Componente que usa el hook
- Integrado en `/app/layout.tsx`

## Pasos para Activar

### Paso 1: Agregar RESEND_API_KEY
1. Ve a https://resend.com
2. Crea una cuenta y obtén tu API Key
3. Agrega a Environment Variables:
   ```
   RESEND_API_KEY=re_xxxxx
   ```

### Paso 2: Ejecutar SQL Triggers (Opcional)
Si quieres que los emails se envíen automáticamente cuando cambia el status de una operación:

1. Ve a Supabase → SQL Editor
2. Ejecuta el script `/scripts/setup-email-triggers.sql`
3. Esto crea triggers que notifican cuando operaciones se completan o cancelan

### Paso 3: Verificar Integración

**Emails Manuales (siempre funcionan):**
- Se envía automáticamente en PaymentStep cuando se crea una operación
- Puedes enviar emails manualmente via API:
  ```
  POST /api/emails/send
  {
    "type": "welcome",
    "to": "user@example.com",
    "data": {
      "userName": "Juan",
      "whatsappNumber": "56956413113"
    }
  }
  ```

**Emails Automáticos (con webhooks):**
- Se envía cuando operación cambia a status "completed"
- Se envía cuando operación cambia a status "cancelled"
- Requiere que los triggers SQL estén ejecutados

## Tipos de Email Disponibles

| Tipo | Destinatario | Trigger |
|------|--------------|---------|
| `welcome` | Usuario | Manual en registro |
| `operation-created` | Usuario | Automático al crear operación (PaymentStep) |
| `operation-completed` | Usuario | Automático cuando status = 'completed' |
| `operation-cancelled` | Usuario | Automático cuando status = 'cancelled' |
| `beneficiary-added` | Usuario | Manual cuando se agrega beneficiario |
| `new-session` | Usuario | Manual en login |
| `admin-new-operation` | Admin | Manual cuando admin crea operación |
| `admin-operation-completed` | Admin | Manual cuando admin marca como completada |

## Variables de Entorno Requeridas

```
RESEND_API_KEY=tu_api_key_de_resend
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Paleta de Colores

- **Primario (Morado):** #7c3aed
- **Secundario (Verde):** #10b981
- **Peligro (Rojo):** #ef4444
- **Fondo:** #f9fafb
- **Texto:** #4b5563

## Próximas Mejoras

1. Agregar templates para otras notificaciones (beneficiarios, rechazos, etc)
2. Implementar retry logic para emails fallidos
3. Agregar tracking de emails abiertos
4. Dashboard de estadísticas de emails
5. Personalización de templates por administrador

## Archivos Creados/Modificados

**Nuevos:**
- `/emails/` (carpeta con 11 archivos)
- `/lib/email-sender.ts`
- `/lib/operation-emails.ts`
- `/lib/email-webhooks.ts`
- `/app/api/emails/send/route.ts`
- `/hooks/useEmailWebhooks.ts`
- `/components/EmailWebhooksInitializer.tsx`
- `/scripts/setup-email-triggers.sql`

**Modificados:**
- `/package.json` - Agregó `@react-email/components`
- `/components/steps/PaymentStep.tsx` - Agregó envío de email
- `/app/layout.tsx` - Agregó inicializador de webhooks
