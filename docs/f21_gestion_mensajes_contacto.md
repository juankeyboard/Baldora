# f21 — Gestión de Mensajes de Contacto

**Estado:** ⏳ Pendiente de implementación
**Versión:** 1.0
**Fecha:** 2026-03-12
**Dependencia:** f20_contacto.md (formulario ya implementado y funcional)

---

## Situación actual

Cada envío del formulario de contacto queda registrado en:

```
Firebase Realtime Database → /contacts/{pushId}
```

Con la siguiente estructura:

```json
{
  "nombre": "string",
  "email": "string",
  "motivo": "string",
  "mensaje": "string",
  "marketingConsent": "boolean",
  "timestamp": "ISO 8601",
  "source": "web_contact_form"
}
```

Actualmente **no existe ningún flujo de revisión, clasificación ni respuesta** para estos mensajes. Se acumulan en la base de datos sin visibilidad operativa.

---

## Problema a resolver

Sin un sistema de gestión, los mensajes de contacto generan tres riesgos concretos:

1. **Pérdida de oportunidades** — consultas comerciales o alianzas que nunca reciben respuesta.
2. **Daño reputacional** — usuarios que reportaron errores o pidieron soporte y no obtuvieron respuesta.
3. **Datos sin valor** — información valiosa (feedback, errores, motivos frecuentes) que no se convierte en aprendizaje del producto.

---

## Sugerencias de sistematización (por evaluar)

### Opción 1 — Notificación por email (mínimo viable, sin código adicional)

**Descripción:** Configurar EmailJS para que cada envío del formulario llegue automáticamente a `juankeyboard@gmail.com`. El administrador revisa su bandeja de entrada y responde manualmente.

**Ventajas:**
- Implementación inmediata (solo configurar EmailJS en `contact.js`).
- Sin infraestructura adicional.
- Familiar para cualquier persona del equipo.

**Desventajas:**
- No hay trazabilidad del estado de cada mensaje (¿fue respondido? ¿está pendiente?).
- Escala mal: a partir de ~20 mensajes/semana se vuelve caótico.
- No permite clasificar ni priorizar.

**Costo:** $0

---

### Opción 2 — Script de revisión en Firebase Console + etiquetas manuales

**Descripción:** Agregar un campo `status` al schema de Firebase (`"pendiente"`, `"respondido"`, `"archivado"`). El administrador actualiza el estado directamente desde Firebase Console o desde una vista admin interna.

**Ventajas:**
- Trazabilidad básica sin herramientas externas.
- Los datos siguen en Firebase (sin migración).
- Permite filtrar por motivo o estado desde la consola.

**Desventajas:**
- Firebase Console no es una interfaz amigable para revisión frecuente.
- Requiere acceso técnico para operar.

**Costo:** $0

---

### Opción 3 — Vista Admin interna en Baldora (recomendada a mediano plazo)

**Descripción:** Crear una vista `#admin-view` dentro del propio SPA, accesible solo para el UID del administrador (autenticado con Google). Muestra la bandeja de mensajes, permite cambiar estados y escribir notas de seguimiento.

**Ventajas:**
- Integración natural con la arquitectura existente.
- Sin herramientas externas.
- Puede evolucionar: agregar respuesta directa, estadísticas de motivos, exportación.
- Control total de datos.

**Desventajas:**
- Requiere desarrollo (~2-4 sesiones de trabajo).
- Solo es útil si hay volumen suficiente de mensajes.

**Costo:** $0 (desarrollo propio)

---

### Opción 4 — Integración con herramienta de helpdesk externa

**Descripción:** Conectar el formulario (vía EmailJS o Firebase Functions) a una herramienta como **Notion**, **Trello**, **Linear** o **Freshdesk**. Cada mensaje crea un ticket o tarjeta automáticamente.

**Ventajas:**
- Flujo profesional de soporte desde el día uno.
- Historial de conversaciones.
- Asignación de responsables, prioridades y SLAs.

**Desventajas:**
- Introduce dependencia de una plataforma externa.
- Las opciones gratuitas tienen límites de uso.
- Requiere integración técnica (Firebase Functions o webhook).

**Costo:** $0–$20 USD/mes según herramienta y volumen.

---

### Opción 5 — Análisis automático con Gemini AI (valor diferencial)

**Descripción:** Usar el servicio Gemini ya integrado en Baldora para clasificar automáticamente cada mensaje entrante: detectar urgencia, extraer temas clave, sugerir respuesta tipo. El resultado se guarda junto al mensaje en Firebase.

**Ventajas:**
- Clasifica y resume sin intervención humana.
- Puede detectar mensajes críticos (errores graves, quejas de datos) y marcarlos con alta prioridad.
- Aprovecha infraestructura ya existente.

**Desventajas:**
- Agrega costo de tokens por cada mensaje procesado.
- Requiere Firebase Functions o procesamiento en backend.
- Solo tiene valor cuando el volumen de mensajes justifica la automatización.

**Costo:** Costo de API Gemini por token (mínimo en etapa temprana).

---

## Recomendación por fases

| Fase | Cuándo aplicarla | Acción recomendada |
|------|-----------------|-------------------|
| **Ahora** | 0–10 mensajes/mes | Configurar EmailJS para notificación inmediata (Opción 1). Responder manualmente desde Gmail. |
| **Corto plazo** | 10–50 mensajes/mes | Agregar campo `status` en Firebase + revisar desde consola (Opción 2). Opcionalmente conectar a Notion. |
| **Mediano plazo** | +50 mensajes/mes | Construir vista admin interna en Baldora (Opción 3). |
| **Largo plazo** | Producto consolidado | Integrar clasificación automática con Gemini (Opción 5). |

---

## Schema ampliado sugerido (para cuando se implemente seguimiento)

```json
{
  "nombre": "string",
  "email": "string",
  "motivo": "string",
  "mensaje": "string",
  "marketingConsent": "boolean",
  "timestamp": "ISO 8601",
  "source": "web_contact_form",
  "status": "pendiente | respondido | archivado",
  "prioridad": "alta | media | baja",
  "nota_interna": "string",
  "respondido_en": "ISO 8601 | null"
}
```

---

## Decisión pendiente

- [ ] Elegir entre Opciones 1–5 (o combinación por fases).
- [ ] Definir SLA de respuesta (ej. 1–3 días hábiles, como se muestra en el formulario).
- [ ] Decidir si EmailJS se configura ahora o se pospone.
- [ ] Definir quién tiene acceso a los mensajes y desde dónde los gestiona.

---

*Última actualización: 2026-03-12 — v1.0 (borrador inicial, pendiente de decisión)*
