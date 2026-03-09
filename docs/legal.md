# Baldora.org - Política de Privacidad y Términos y Condiciones

> Este documento define una versión base de los documentos legales de **Baldora.org**, adaptada al contexto del proyecto: una aplicación web educativa para practicar multiplicación, con autenticación opcional mediante Google, persistencia de historial en Firebase, exportación de datos de sesión y una tienda integrada para usuarios registrados. El contenido toma como referencia la legislación colombiana vigente y el principio de minimización de datos.

---

## 0. Marco Legal Aplicable (Colombia)

| Ley | Nombre | Relevancia para Baldora.org | Autoridad |
|---|---|---|---|
| **Ley 1581 de 2012** | Protección de datos personales | Política de privacidad, consentimiento, derechos del titular | SIC |
| **Decreto 1377 de 2013** | Reglamentación de la Ley 1581 | Tratamiento de datos, consentimiento y seguridad | SIC |
| **Ley 527 de 1999** | Comercio electrónico | Validez de aceptaciones digitales y conservación de registros | SIC |
| **Ley 1480 de 2011** | Estatuto del Consumidor | Información previa, retracto y compras en línea | SIC |
| **Ley 2439 de 2024** | Reforma al Estatuto del Consumidor | Reembolsos y soporte al consumidor | SIC |
| **Ley 1273 de 2009** | Delitos informáticos | Deberes de seguridad y protección de sistemas | Fiscalía |

### 0.1 Principios Base

| No. | Principio | Aplicación en Baldora.org |
|---|---|---|
| 1 | Minimización de datos | Se recopilan solo datos necesarios para identidad, uso y progreso |
| 2 | Transparencia | El usuario sabe qué datos se usan y para qué |
| 3 | Control del usuario | El usuario puede consultar, exportar o solicitar la eliminación de sus datos |
| 4 | Separación funcional | El juego funciona sin login; la cuenta Google agrega funciones opcionales |
| 5 | Integración segura | Los pagos y compras se delegan a plataformas externas especializadas |

---

## 1. Política de Privacidad

### 1.1 Datos que Baldora.org Recopila

| Dato | Fuente | Propósito | Almacenamiento |
|---|---|---|---|
| Nickname | Usuario no autenticado | Identificar la sesión local | Sesión local / CSV exportado |
| Nombre de Google | Google Sign-In | Identidad del usuario autenticado | Firebase |
| Email | Google Sign-In | Asociación de cuenta y acceso | Firebase |
| Foto de perfil | Google Sign-In | Mostrar avatar en interfaz | URL externa / Firebase |
| Historial de partidas | Uso de la app | Seguimiento de progreso y perfil | Firebase Realtime Database |
| Estadísticas agregadas | Uso de la app | Analíticas personales y comunidad | Firebase Realtime Database |
| CSV exportado por el usuario | Sesión de juego | Descarga local de resultados | Dispositivo del usuario |
| Historial de compras | Tienda para usuarios registrados | Consulta por fecha y seguimiento de compras | Integración con Shopify y/o backend asociado |

### 1.2 Datos que Baldora.org No Recopila

- Datos de tarjetas de crédito o débito directamente en servidores propios.
- Datos biométricos.
- Ubicación geográfica precisa.
- Contactos del dispositivo.
- Datos sensibles no necesarios para la función educativa del producto.

### 1.3 Uso de los Datos

Los datos se usan exclusivamente para:

1. Permitir el uso de Baldora.org como herramienta educativa interactiva.
2. Guardar el historial de partidas y el progreso del usuario autenticado.
3. Mostrar analíticas, métricas y posición comunitaria cuando aplica.
4. Permitir exportación de sesiones en formato CSV.
5. Habilitar funciones de tienda para usuarios registrados.
6. Consultar historial de compras por fecha dentro del entorno autenticado.
7. Mejorar la experiencia y estabilidad del producto.

### 1.4 Compartición con Terceros

| Tercero | Datos compartidos | Propósito |
|---|---|---|
| **Google / Firebase** | Datos de autenticación, perfil y persistencia | Login, hosting, base de datos y servicios asociados |
| **Shopify** | Datos necesarios para compra y consulta de pedidos | Comercio electrónico y gestión de órdenes |

> Baldora.org no vende datos personales a terceros.

### 1.5 Cookies y Tecnologías Similares

- Se usan cookies esenciales de sesión y autenticación.
- Existen cookies técnicas necesarias para Firebase y para la integración de compra externa.
- No se activan cookies publicitarias o de seguimiento invasivo sin consentimiento aplicable.

### 1.6 Derechos del Usuario

De acuerdo con la Ley 1581 de 2012, el usuario puede:

| Derecho | Alcance |
|---|---|
| Acceso | Conocer qué datos suyos se almacenan |
| Rectificación | Solicitar corrección de datos inexactos |
| Supresión | Solicitar eliminación de cuenta y datos asociados |
| Portabilidad | Solicitar exportación de los datos disponibles |
| Revocación | Retirar consentimiento cuando el tratamiento lo permita |

### 1.7 Transferencias Internacionales

- Parte de la infraestructura opera en servidores fuera de Colombia, incluyendo servicios de Google/Firebase y Shopify.
- El usuario acepta esta transferencia al usar las funciones que dependen de dichos proveedores.
- Baldora.org informa esta situación de manera visible en la versión pública de la política.

### 1.8 Menores de Edad

- Baldora.org es una herramienta educativa y puede ser usada por estudiantes.
- Si el usuario es menor de edad y va a crear una cuenta, realizar compras o compartir datos personales, se recomienda autorización y acompañamiento de un padre, madre o acudiente.
- Las funciones de compra quedan restringidas a usuarios registrados y bajo el marco de autorización aplicable.

### 1.9 Retención de Datos

| Tipo de dato | Período de referencia |
|---|---|
| Perfil autenticado | Mientras la cuenta esté activa y durante el periodo técnico o legal necesario |
| Historial de partidas | Mientras la cuenta esté activa o hasta solicitud de eliminación |
| Registros de compras | Según obligaciones legales, operativas y de soporte |
| Consentimientos y aceptaciones | Período razonable de evidencia legal |

---

## 2. Términos y Condiciones

### 2.1 Aceptación

- Al usar Baldora.org, el usuario acepta estos términos en lo aplicable.
- Si crea una cuenta o usa funciones restringidas, se requiere una aceptación expresa adicional.

### 2.2 Naturaleza del Servicio

- Baldora.org es una aplicación web educativa enfocada en la práctica de tablas de multiplicar y agilidad mental.
- Las métricas, analíticas y clasificaciones son herramientas de apoyo y no constituyen una certificación oficial de rendimiento académico.

### 2.3 Cuenta de Usuario

- La autenticación con Google es opcional.
- Sin login, el usuario puede usar el flujo base con un nickname manual.
- Con login, se habilitan funciones adicionales, como historial en la nube, perfil, analíticas personales, comunidad y tienda.
- El usuario es responsable del uso seguro de su cuenta de Google.

### 2.4 Uso Aceptable

El usuario se compromete a no:

- Manipular el sistema para alterar rankings o estadísticas de forma fraudulenta.
- Intentar acceder a datos de otros usuarios.
- Interferir con la disponibilidad o seguridad de la plataforma.
- Usar la tienda o los enlaces de compra con fines ilícitos.

### 2.5 Compras y Tienda

- La tienda de Baldora.org está pensada para usuarios registrados.
- El acceso a la tienda se realiza desde la vista autenticada del usuario.
- Los botones de compra redirigen a páginas de Shopify para completar la transacción.
- La información visual de productos se adapta al estilo de Baldora.org aunque la compra final ocurra en Shopify.
- Los enlaces de compra, precios, imágenes y disponibilidad dependen de la integración vigente con Shopify.

### 2.6 Historial de Compras

- El usuario registrado puede consultar su historial de compras por fecha, sujeto a la implementación técnica disponible.
- La fuente del historial puede provenir de Shopify, de una capa de backend o de una sincronización entre ambos sistemas.

### 2.7 Pagos, Reembolsos y Retracto

- Las condiciones concretas de pago, retracto y reembolso se alinean con el flujo final de Shopify y con la legislación colombiana aplicable.
- Si se venden productos o servicios digitales, las reglas de retracto y reembolso pueden variar según el tipo de entrega y el momento de acceso.
- La versión pública final precisa los tiempos, canales y exclusiones antes de activar comercialmente la tienda.

### 2.8 Propiedad Intelectual

- El código fuente y los recursos de Baldora.org se distribuyen bajo la Licencia MIT.
- Esto permite la reutilización, modificación y distribución del software, siempre que se incluya el aviso de licencia original.
- El nombre "Baldora.org", el logo y otros elementos de marca específicos pueden estar sujetos a derechos de marca registrada.

### 2.9 Limitación de Responsabilidad

- Baldora.org se ofrece según la disponibilidad razonable del servicio.
- No se garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores.
- Baldora.org no responde por fallos atribuibles a terceros, incluyendo Google, Firebase, Shopify o la conectividad del usuario.

### 2.10 Soporte

- El proyecto ofrece un canal visible de contacto o soporte.
- Las incidencias relacionadas con cuenta, datos o compras se registran con fecha y trazabilidad.

### 2.11 Jurisdicción

- Este documento se rige por las leyes de la República de Colombia.
- La autoridad administrativa de referencia en materia de protección al consumidor y datos personales es la SIC.

### 2.12 Modificaciones

- Baldora.org puede actualizar estos documentos cuando cambie el producto, su arquitectura o su modelo comercial.
- La fecha de última actualización se muestra en la versión publicada.
- Si el cambio afecta derechos del usuario o tratamiento de datos, se recomienda una nueva aceptación expresa.

---

## 3. Implementación Recomendada en Baldora.org

### 3.1 Rutas o Documentos Públicos

| Recurso | Uso |
|---|---|
| `/politica-de-privacidad` | Versión pública de privacidad |
| `/terminos-y-condiciones` | Versión pública de términos |
| `docs/legal.md` | Base documental interna del proyecto |

### 3.2 Puntos de Aceptación

- Primer login con Google.
- Activación de funciones de tienda.
- Footer con enlaces permanentes a privacidad y términos.
- Banner o aviso de cookies si la implementación final lo requiere.

### 3.3 Coherencia con Baldora.org

- Mantener el lenguaje simple y legible.
- Alinear el diseño de las páginas legales con el sistema visual del proyecto.
- Reflejar con precisión la diferencia entre el flujo sin login y el flujo autenticado.
- Actualizar este documento cuando cambien la autenticación, las analíticas, la exportación o la tienda.

---

## 4. Pendientes para Versión Pública Final

- Definir razón social o titular legal responsable de Baldora.org.
- Definir correo oficial de contacto legal y de soporte.
- Confirmar flujo exacto de compras, reembolsos y fuente del historial de pedidos.
- Confirmar si la exportación de datos del perfil se entregará como CSV, JSON o ambos.
- Separar este documento en dos páginas públicas si se implementa en un sitio productivo.
