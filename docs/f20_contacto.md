# f20 — Vista de Contacto

**Estado:** Implementado
**Version:** 1.0
**Fecha:** 2026-03-12
**Modulo:** BaldoraContact
**Archivos:**
- `js/contact.js` — logica del formulario y envio
- `css/contact.css` — estilos de la vista
- `index.html` — seccion #contact-view y enlace footer

---

## 1. Objetivo

Proveer un canal de contacto directo con el equipo de Baldora, accesible desde el footer,
que:

- Permita enviar mensajes al correo `juankeyboard@gmail.com`
- Cumpla con la Ley 1581 de 2012 (Colombia) en tratamiento de datos personales
- Almacene cada envio en Firebase Realtime Database como registro trazable
- Soporte envio de email real via EmailJS (configurable sin backend adicional)

---

## 2. Acceso

El enlace **"Contacto"** se agrega al footer institucional junto a "Privacidad" y "Terminos",
con ID `footer-link-contact`. Al hacer clic, `BaldoraContact.show()` activa la vista
`#contact-view` usando el mismo patron aditivo de `BaldoraStore` y `BaldoraLegal`
(manipulacion directa de clases `.view.active`).

---

## 3. Campos del formulario

| Campo                    | Tipo      | Obligatorio | Validacion                       |
|--------------------------|-----------|-------------|----------------------------------|
| Nombre                   | text      | Si          | Min 1 char, max 100              |
| Correo electronico       | email     | Si          | Formato valido, max 200          |
| Motivo                   | select    | Si          | Opciones predefinidas            |
| Mensaje                  | textarea  | Si          | Max 2000 chars, contador visible |
| Consentimiento de datos  | checkbox  | Si          | Autorizacion Ley 1581 (obligatorio) |
| Consentimiento marketing | checkbox  | No          | Opt-in independiente y opcional  |

### 3.1 Opciones de motivo

- Soporte tecnico
- Consulta comercial
- Sugerencia o retroalimentacion
- Reporte de error
- Otro

---

## 4. Flujo de envio

```
Validacion cliente → saveToFirebase() → sendEmail() → UI feedback
```

1. **Validacion**: todos los campos obligatorios y checkbox de consentimiento
2. **Firebase**: guarda en `/contacts/{pushId}` (registro trazable, siempre)
3. **EmailJS**: si esta configurado, envia al correo `juankeyboard@gmail.com`
4. **Feedback**: mensaje de exito o error visible en el formulario

---

## 5. Estructura Firebase: `/contacts/{pushId}`

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

---

## 6. Configuracion EmailJS

Para activar el envio real de email:

1. Crear cuenta gratuita en [emailjs.com](https://www.emailjs.com/)
2. Conectar servicio Gmail con `juankeyboard@gmail.com`
3. Crear plantilla con variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
4. Editar `js/contact.js` → objeto `EMAILJS_CONFIG`:

```js
EMAILJS_CONFIG: {
    PUBLIC_KEY:  'tu_public_key',    // ej. 'user_xxxxxxxxxxxx'
    SERVICE_ID:  'service_gmail',    // ej. 'service_xxxxx'
    TEMPLATE_ID: 'template_contacto', // ej. 'template_xxxxx'
},
```

**Sin configurar**: el formulario guarda en Firebase y muestra exito al usuario.
Los mensajes quedan disponibles en Firebase Console → Realtime Database → /contacts.

---

## 7. Cumplimiento legal (Ley 1581/2012 — Colombia)

Segun lo definido en `f18_captacion-datos-venta.md` (Iteracion 1 — Formulario de contacto comercial):

- **Checkbox obligatorio**: autorizacion para tratar datos con la finalidad de responder
  la solicitud (f18 §6.1)
- **Checkbox opcional** e independiente: autorizacion para comunicaciones comerciales
  futuras (f18 §6.2)
- **No se mezclan finalidades**: soporte distinto de marketing
- **Trazabilidad**: cada envio incluye timestamp ISO y fuente, guardado en Firebase
- **Enlace a politica**: el checkbox vincula directamente a `#privacy-view`

---

## 8. Modulo BaldoraContact

Patron modular aditivo (no modifica ningun modulo existente):

```
BaldoraContact
├── EMAILJS_CONFIG       — credenciales EmailJS (a configurar)
├── RECIPIENT_EMAIL      — 'juankeyboard@gmail.com'
├── init()               — setup footer + formulario
├── show()               — activa vista, guarda vista previa
├── hide()               — vuelve a previousView o CONFIG
├── _handleSubmit()      — orquesta: validar → Firebase → email → UI
├── _validate()          — campos obligatorios + consentimiento
├── _collectData()       — construye objeto de datos
├── _saveToFirebase()    — push a /contacts (Promise)
├── _sendEmail()         — emailjs.send() si esta configurado (Promise)
└── [UI helpers]         — loading, success, error, reset
```

---

## 9. Reglas Firebase — /contacts

Agregado a `database.rules.json`:

```json
"contacts": {
  ".read": false,
  ".write": true
}
```

- **Escritura publica**: el formulario no requiere autenticacion
- **Lectura bloqueada**: solo accesible desde Firebase Console (admin)

---

## 10. Notas de implementacion

- La vista usa la clase `.view` estandar del SPA (misma maquina de estados)
- El CSS usa variables `--clr-rose-500`, `--font-display`, `--font-body` del design system
- No modifica `app.js`, `auth.js`, ni ningun modulo existente
- Compatible con i18n futuro: atributos `data-i18n` pendientes de mapear a `i18n.js`
- El boton del footer tiene `id="footer-link-contact"` para facilitar referencias
