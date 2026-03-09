# Baldora.org - PolÃ­tica de Privacidad y TÃ©rminos y Condiciones

> Este documento define una versiÃ³n base de los documentos legales de **Baldora.org**, adaptada al contexto del proyecto: una aplicaciÃ³n web educativa para practicar multiplicaciÃ³n, con autenticaciÃ³n opcional mediante Google, persistencia de historial en Firebase, exportaciÃ³n de datos de sesiÃ³n y una tienda integrada para usuarios registrados. El contenido toma como referencia la legislaciÃ³n colombiana vigente y el principio de minimizaciÃ³n de datos.

---

## 0. Marco Legal Aplicable (Colombia)

| Ley | Nombre | Relevancia para Baldora.org | Autoridad |
|---|---|---|---|
| **Ley 1581 de 2012** | ProtecciÃ³n de datos personales | PolÃ­tica de privacidad, consentimiento, derechos del titular | SIC |
| **Decreto 1377 de 2013** | ReglamentaciÃ³n de la Ley 1581 | Tratamiento de datos, consentimiento y seguridad | SIC |
| **Ley 527 de 1999** | Comercio electrÃ³nico | Validez de aceptaciones digitales y conservaciÃ³n de registros | SIC |
| **Ley 1480 de 2011** | Estatuto del Consumidor | InformaciÃ³n previa, retracto y compras en lÃ­nea | SIC |
| **Ley 2439 de 2024** | Reforma al Estatuto del Consumidor | Reembolsos y soporte al consumidor | SIC |
| **Ley 1273 de 2009** | Delitos informÃ¡ticos | Deberes de seguridad y protecciÃ³n de sistemas | FiscalÃ­a |

### 0.1 Principios Base

| No. | Principio | AplicaciÃ³n en Baldora.org |
|---|---|---|
| 1 | MinimizaciÃ³n de datos | Se recopilan solo datos necesarios para identidad, uso y progreso |
| 2 | Transparencia | El usuario sabe quÃ© datos se usan y para quÃ© |
| 3 | Control del usuario | El usuario puede consultar, exportar o solicitar la eliminaciÃ³n de sus datos |
| 4 | SeparaciÃ³n funcional | El juego funciona sin login; la cuenta Google agrega funciones opcionales |
| 5 | IntegraciÃ³n segura | Los pagos y compras se delegan a plataformas externas especializadas |

---

## 1. PolÃ­tica de Privacidad

### 1.1 Datos que Baldora.org Recopila

| Dato | Fuente | PropÃ³sito | Almacenamiento |
|---|---|---|---|
| Nickname | Usuario no autenticado | Identificar la sesiÃ³n local | SesiÃ³n local / CSV exportado |
| Nombre de Google | Google Sign-In | Identidad del usuario autenticado | Firebase |
| Email | Google Sign-In | AsociaciÃ³n de cuenta y acceso | Firebase |
| Foto de perfil | Google Sign-In | Mostrar avatar en interfaz | URL externa / Firebase |
| Historial de partidas | Uso de la app | Seguimiento de progreso y perfil | Firebase Realtime Database |
| EstadÃ­sticas agregadas | Uso de la app | AnalÃ­ticas personales y comunidad | Firebase Realtime Database |
| CSV exportado por el usuario | SesiÃ³n de juego | Descarga local de resultados | Dispositivo del usuario |
| Historial de compras | Tienda para usuarios registrados | Consulta por fecha y seguimiento de compras | IntegraciÃ³n con Shopify y/o backend asociado |

### 1.2 Datos que Baldora.org No Recopila

- Datos de tarjetas de crÃ©dito o dÃ©bito directamente en servidores propios.
- Datos biomÃ©tricos.
- UbicaciÃ³n geogrÃ¡fica precisa.
- Contactos del dispositivo.
- Datos sensibles no necesarios para la funciÃ³n educativa del producto.

### 1.3 Uso de los Datos

Los datos se usan exclusivamente para:

1. Permitir el uso de Baldora.org como herramienta educativa interactiva.
2. Guardar el historial de partidas y el progreso del usuario autenticado.
3. Mostrar analÃ­ticas, mÃ©tricas y posiciÃ³n comunitaria cuando aplica.
4. Permitir exportaciÃ³n de sesiones en formato CSV.
5. Habilitar funciones de tienda para usuarios registrados.
6. Consultar historial de compras por fecha dentro del entorno autenticado.
7. Mejorar la experiencia y estabilidad del producto.

### 1.4 ComparticiÃ³n con Terceros

| Tercero | Datos compartidos | PropÃ³sito |
|---|---|---|
| **Google / Firebase** | Datos de autenticaciÃ³n, perfil y persistencia | Login, hosting, base de datos y servicios asociados |
| **Shopify** | Datos necesarios para compra y consulta de pedidos | Comercio electrÃ³nico y gestiÃ³n de Ã³rdenes |

> Baldora.org no vende datos personales a terceros.

### 1.5 Cookies y TecnologÃ­as Similares

- Se usan cookies esenciales de sesiÃ³n y autenticaciÃ³n.
- Existen cookies tÃ©cnicas necesarias para Firebase y para la integraciÃ³n de compra externa.
- No se activan cookies publicitarias o de seguimiento invasivo sin consentimiento aplicable.

### 1.6 Derechos del Usuario

De acuerdo con la Ley 1581 de 2012, el usuario puede:

| Derecho | Alcance |
|---|---|
| Acceso | Conocer quÃ© datos suyos se almacenan |
| RectificaciÃ³n | Solicitar correcciÃ³n de datos inexactos |
| SupresiÃ³n | Solicitar eliminaciÃ³n de cuenta y datos asociados |
| Portabilidad | Solicitar exportaciÃ³n de los datos disponibles |
| RevocaciÃ³n | Retirar consentimiento cuando el tratamiento lo permita |

### 1.7 Transferencias Internacionales

- Parte de la infraestructura opera en servidores fuera de Colombia, incluyendo servicios de Google/Firebase y Shopify.
- El usuario acepta esta transferencia al usar las funciones que dependen de dichos proveedores.
- Baldora.org informa esta situaciÃ³n de manera visible en la versiÃ³n pÃºblica de la polÃ­tica.

### 1.8 Menores de Edad

- Baldora.org es una herramienta educativa y puede ser usada por estudiantes.
- Si el usuario es menor de edad y va a crear una cuenta, realizar compras o compartir datos personales, se recomienda autorizaciÃ³n y acompaÃ±amiento de un padre, madre o acudiente.
- Las funciones de compra quedan restringidas a usuarios registrados y bajo el marco de autorizaciÃ³n aplicable.

### 1.9 RetenciÃ³n de Datos

| Tipo de dato | PerÃ­odo de referencia |
|---|---|
| Perfil autenticado | Mientras la cuenta estÃ© activa y durante el periodo tÃ©cnico o legal necesario |
| Historial de partidas | Mientras la cuenta estÃ© activa o hasta solicitud de eliminaciÃ³n |
| Registros de compras | SegÃºn obligaciones legales, operativas y de soporte |
| Consentimientos y aceptaciones | PerÃ­odo razonable de evidencia legal |

---

## 2. TÃ©rminos y Condiciones

### 2.1 AceptaciÃ³n

- Al usar Baldora.org, el usuario acepta estos tÃ©rminos en lo aplicable.
- Si crea una cuenta o usa funciones restringidas, se requiere una aceptaciÃ³n expresa adicional.

### 2.2 Naturaleza del Servicio

- Baldora.org es una aplicaciÃ³n web educativa enfocada en la prÃ¡ctica de tablas de multiplicar y agilidad mental.
- Las mÃ©tricas, analÃ­ticas y clasificaciones son herramientas de apoyo y no constituyen una certificaciÃ³n oficial de rendimiento acadÃ©mico.

### 2.3 Cuenta de Usuario

- La autenticaciÃ³n con Google es opcional.
- Sin login, el usuario puede usar el flujo base con un nickname manual.
- Con login, se habilitan funciones adicionales, como historial en la nube, perfil, analÃ­ticas personales, comunidad y tienda.
- El usuario es responsable del uso seguro de su cuenta de Google.

### 2.4 Uso Aceptable

El usuario se compromete a no:

- Manipular el sistema para alterar rankings o estadÃ­sticas de forma fraudulenta.
- Intentar acceder a datos de otros usuarios.
- Interferir con la disponibilidad o seguridad de la plataforma.
- Usar la tienda o los enlaces de compra con fines ilÃ­citos.

### 2.5 Compras y Tienda

- La tienda de Baldora.org estÃ¡ pensada para usuarios registrados.
- El acceso a la tienda se realiza desde la vista autenticada del usuario.
- Los botones de compra redirigen a pÃ¡ginas de Shopify para completar la transacciÃ³n.
- La informaciÃ³n visual de productos se adapta al estilo de Baldora.org aunque la compra final ocurra en Shopify.
- Los enlaces de compra, precios, imÃ¡genes y disponibilidad dependen de la integraciÃ³n vigente con Shopify.

### 2.6 Historial de Compras

- El usuario registrado puede consultar su historial de compras por fecha, sujeto a la implementaciÃ³n tÃ©cnica disponible.
- La fuente del historial puede provenir de Shopify, de una capa de backend o de una sincronizaciÃ³n entre ambos sistemas.

### 2.7 Pagos, Reembolsos y Retracto

- Las condiciones concretas de pago, retracto y reembolso se alinean con el flujo final de Shopify y con la legislaciÃ³n colombiana aplicable.
- Si se venden productos o servicios digitales, las reglas de retracto y reembolso pueden variar segÃºn el tipo de entrega y el momento de acceso.
- La versiÃ³n pÃºblica final precisa los tiempos, canales y exclusiones antes de activar comercialmente la tienda.

### 2.8 Propiedad Intelectual

- El cÃ³digo fuente y los recursos de Baldora.org se distribuyen bajo la Licencia MIT.
- Esto permite la reutilizaciÃ³n, modificaciÃ³n y distribuciÃ³n del software, siempre que se incluya el aviso de licencia original.
- El nombre "Baldora.org", el logo y otros elementos de marca especÃ­ficos pueden estar sujetos a derechos de marca registrada.

### 2.9 LimitaciÃ³n de Responsabilidad

- Baldora.org se ofrece segÃºn la disponibilidad razonable del servicio.
- No se garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores.
- Baldora.org no responde por fallos atribuibles a terceros, incluyendo Google, Firebase, Shopify o la conectividad del usuario.

### 2.10 Soporte

- El proyecto ofrece un canal visible de contacto o soporte.
- Las incidencias relacionadas con cuenta, datos o compras se registran con fecha y trazabilidad.

### 2.11 JurisdicciÃ³n

- Este documento se rige por las leyes de la RepÃºblica de Colombia.
- La autoridad administrativa de referencia en materia de protecciÃ³n al consumidor y datos personales es la SIC.

### 2.12 Modificaciones

- Baldora.org puede actualizar estos documentos cuando cambie el producto, su arquitectura o su modelo comercial.
- La fecha de Ãºltima actualizaciÃ³n se muestra en la versiÃ³n publicada.
- Si el cambio afecta derechos del usuario o tratamiento de datos, se recomienda una nueva aceptaciÃ³n expresa.

---

## 3. ImplementaciÃ³n Recomendada en Baldora.org

### 3.1 Rutas o Documentos PÃºblicos

| Recurso | Uso |
|---|---|
| `/politica-de-privacidad` | VersiÃ³n pÃºblica de privacidad |
| `/terminos-y-condiciones` | VersiÃ³n pÃºblica de tÃ©rminos |
| `docs/f17_legal.md` | Base documental interna del proyecto |

### 3.2 Puntos de AceptaciÃ³n

- Primer login con Google.
- ActivaciÃ³n de funciones de tienda.
- Footer con enlaces permanentes a privacidad y tÃ©rminos.
- Banner o aviso de cookies si la implementaciÃ³n final lo requiere.

### 3.3 Coherencia con Baldora.org

- Mantener el lenguaje simple y legible.
- Alinear el diseÃ±o de las pÃ¡ginas legales con el sistema visual del proyecto.
- Reflejar con precisiÃ³n la diferencia entre el flujo sin login y el flujo autenticado.
- Actualizar este documento cuando cambien la autenticaciÃ³n, las analÃ­ticas, la exportaciÃ³n o la tienda.

---

## 4. Pendientes para VersiÃ³n PÃºblica Final

- Definir razÃ³n social o titular legal responsable de Baldora.org.
- Definir correo oficial de contacto legal y de soporte.
- Confirmar flujo exacto de compras, reembolsos y fuente del historial de pedidos.
- Confirmar si la exportaciÃ³n de datos del perfil se entregarÃ¡ como CSV, JSON o ambos.
- Separar este documento en dos pÃ¡ginas pÃºblicas si se implementa en un sitio productivo.

