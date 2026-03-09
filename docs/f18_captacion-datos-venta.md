# Baldora - Captacion de Datos con Fines de Venta en Colombia

**Estado:** Borrador de trabajo
**Ultima actualizacion:** 2026-03-09
**Alcance:** Documento interno para iterar mecanismos de recoleccion de datos personales en el sitio web con propositos comerciales

> **Nota importante:** Este documento es una base de producto y cumplimiento, no reemplaza la asesoria de un abogado en Colombia. Fue estructurado con referencia a fuentes oficiales verificadas el **2026-03-09**, principalmente la **Ley 1581 de 2012**, el marco reglamentario compilado en **Decreto 1074 de 2015 / Decreto 1377 de 2013**, y orientaciones y actuaciones de la **Superintendencia de Industria y Comercio (SIC)**.

---

## 1. Objetivo

Definir y comparar formas **legalmente mas seguras** de recoger datos de personas que visitan el sitio web para:

- responder solicitudes comerciales;
- convertir visitantes en leads;
- hacer seguimiento comercial;
- vender productos o servicios;
- medir interes comercial sin exceder la finalidad autorizada.

---

## 2. Principios legales base

### 2.1 Reglas que deben gobernar cualquier mecanismo

- **Autorizacion previa, informada y comprobable** para tratar datos personales cuando aplique.
- **Finalidad clara y especifica**: no basta decir "para fines comerciales" si el uso real incluye email marketing, WhatsApp, perfilamiento, remarketing o cesion a terceros.
- **Libertad**: el silencio no vale como autorizacion.
- **Minimizacion**: pedir solo los datos estrictamente necesarios.
- **Separacion de finalidades**: una cosa es atender una solicitud y otra distinta hacer prospeccion comercial recurrente.
- **Trazabilidad**: debe poder probarse cuando y como autorizo el titular.
- **Canal de derechos**: acceso, correccion, revocatoria y supresion.

### 2.2 Inferencia practica para Baldora

Con base en las fuentes revisadas, la forma mas segura en Colombia es asumir que todo dato identificable usado para venta o prospeccion debe estar respaldado por:

1. informacion previa visible;
2. autorizacion verificable;
3. politica de tratamiento;
4. posibilidad real de retiro o revocatoria.

---

## 3. Formas legales de captacion a iterar

## Iteracion 1 - Formulario de contacto comercial

**Nivel de riesgo:** Bajo a medio
**Uso:** "Quiero informacion", "Solicitar demo", "Hablar con ventas"

### Estructura legal recomendable

- Campos minimos: nombre, email, motivo del contacto.
- Texto de finalidad visible antes del envio.
- Checkbox obligatorio para tratamiento de datos personales.
- Checkbox separado y opcional si ademas se quiere enviar marketing posterior.

### Ventaja

- Es la forma mas clara de vincular finalidad y autorizacion.

### Riesgo

- Usar el email luego para campañas generales si solo autorizo respuesta a su consulta.

### Decision recomendada

- Separar:
  - consentimiento para responder la solicitud;
  - consentimiento para comunicaciones comerciales futuras.

---

## Iteracion 2 - Registro de cuenta con opt-in comercial separado

**Nivel de riesgo:** Medio
**Uso:** usuarios que crean cuenta o ingresan con Google

### Estructura legal recomendable

- La cuenta puede recolectar datos necesarios para autenticar y operar el servicio.
- El marketing no debe quedar mezclado con la autorizacion base de uso del producto.
- Debe haber una casilla independiente para recibir ofertas, novedades o promociones.

### Ventaja

- Permite construir base de usuarios y base comercial sin mezclar propositos.

### Riesgo

- Forzar al usuario a aceptar publicidad para poder crear cuenta puede debilitar la validez del consentimiento.

### Decision recomendada

- Mantener el marketing como opcion independiente y no condicion de acceso, salvo que el modelo del producto justifique otra cosa y se revise legalmente.

---

## Iteracion 3 - Newsletter o lead magnet

**Nivel de riesgo:** Bajo a medio
**Uso:** descargar guia, recibir novedades, unirse a lista de espera

### Estructura legal recomendable

- Formulario corto: email y, si hace falta, nombre.
- Mensaje claro de que el usuario se esta suscribiendo a comunicaciones comerciales.
- Confirmacion posterior por correo altamente recomendable.

### Ventaja

- El proposito comercial queda claro desde el inicio.

### Riesgo

- Formularios ambiguos del tipo "descarga este recurso" y luego uso del correo para ventas no explicitadas.

### Decision recomendada

- Si hay lead magnet, informar expresamente si el correo entrara tambien a secuencias comerciales.

---

## Iteracion 4 - Checkout o proceso de compra

**Nivel de riesgo:** Medio
**Uso:** venta directa de productos o servicios

### Estructura legal recomendable

- Recoger solo datos necesarios para pago, facturacion, entrega y soporte.
- Diferenciar comunicaciones transaccionales de comunicaciones promocionales.
- Incluir autorizacion separada si se quiere usar el dato del comprador para remarketing o campañas futuras.

### Ventaja

- Existe una relacion comercial real y una finalidad contractual evidente.

### Riesgo

- Asumir que comprar equivale a autorizar marketing futuro por cualquier canal.

### Decision recomendada

- Tratar la compra como base para mensajes operativos, no como pase automatico a toda comunicacion comercial.

---

## Iteracion 5 - WhatsApp, chat o agenda comercial

**Nivel de riesgo:** Medio
**Uso:** boton "Hablar por WhatsApp", chatbot, agenda de llamada

### Estructura legal recomendable

- Informar que al iniciar el contacto se trataran sus datos para atender la solicitud.
- Si luego se quiere continuar con envios comerciales recurrentes, obtener autorizacion adicional.
- Registrar la fuente del lead y la fecha del consentimiento.

### Ventaja

- Alta conversion comercial.

### Riesgo

- Pasar de conversacion puntual a prospeccion repetitiva sin autorizacion valida.

### Decision recomendada

- Diferenciar contacto solicitado por el usuario de listas promocionales permanentes.

---

## Iteracion 6 - Cookies, pixeles y audiencias publicitarias

**Nivel de riesgo:** Medio a alto
**Uso:** remarketing, medicion de conversion, audiencias similares

### Estructura legal recomendable

- Banner o capa de informacion clara.
- Explicar que tecnologias se usan y con que finalidad.
- Permitir aceptar o rechazar categorias no esenciales.
- Reflejar el uso en la politica de privacidad y cookies.

### Inferencia operativa

Aunque la regulacion colombiana no replica exactamente el modelo europeo de cookies, si los identificadores permiten asociar comportamiento a personas o perfiles comerciales, el escenario prudente es manejar consentimiento informado antes de activar herramientas no esenciales de publicidad o remarketing.

### Riesgo

- Activar pixeles publicitarios desde la carga inicial sin informacion suficiente.

### Decision recomendada

- Si se usaran Meta Pixel, Google Ads o herramientas similares, tratarlas como categoria separada de analitica esencial.

---

## Iteracion 7 - Bases compradas, scrapeadas o tomadas de fuentes publicas

**Nivel de riesgo:** Alto
**Uso:** prospeccion masiva

### Evaluacion

- Es la opcion mas riesgosa.
- La SIC ha reiterado que no basta con que un dato sea accesible o haya sido obtenido de una fuente publica para usarlo libremente con fines comerciales.
- La prospeccion comercial sin autorizacion previa, expresa e informada ya ha generado sanciones recientes.

### Decision recomendada

- **No usar** bases compradas, scrapeadas ni extraidas de fuentes publicas para campañas de venta sin base legal y autorizacion demostrable.

---

## 4. Lo que no deberiamos hacer

- Casillas premarcadas para marketing.
- Textos vagos como "acepto terminos" sin explicar el tratamiento de datos.
- Reutilizar un dato para una finalidad no anunciada.
- Capturar mas datos de los necesarios "por si luego sirven".
- Mezclar soporte, operacion y marketing en una sola autorizacion opaca.
- Importar contactos desde terceros sin prueba del consentimiento.
- Hacer scraping de correos o telefonos de paginas publicas para contactar con fines de venta.

---

## 5. Requisitos minimos antes de activar captacion comercial

- Politica de tratamiento de datos personales publicada.
- Aviso de privacidad resumido en cada punto de captura.
- Registro de consentimiento con fecha, texto aceptado, canal y evidencia.
- Flujo de revocatoria o desuscripcion.
- Matriz de finalidades por formulario.
- Contratos o terminos con encargados del tratamiento si se usan terceros.
- Definicion de tiempos de conservacion.
- Medidas de seguridad basicas para formularios, CRM, email marketing y bases de datos.

---

## 6. Estructuras recomendadas de consentimiento

### 6.1 Solicitud comercial puntual

**Objetivo:** responder al mensaje del visitante.

**Patron recomendado:**

- Checkbox obligatorio:
  - "Autorizo el tratamiento de mis datos para atender mi solicitud de informacion conforme a la Politica de Privacidad."

### 6.2 Marketing futuro

**Objetivo:** enviar promociones o seguimiento comercial recurrente.

**Patron recomendado:**

- Checkbox opcional:
  - "Autorizo recibir ofertas, novedades y comunicaciones comerciales por email y/o WhatsApp."

### 6.3 Compra

**Objetivo:** ejecutar transaccion.

**Patron recomendado:**

- Tratamiento contractual o precontractual claramente informado.
- Opt-in separado si se quiere aprovechar el dato para marketing posterior.

---

## 7. Preguntas abiertas para la siguiente iteracion

- Que datos exactos quiere captar Baldora para venta: email, telefono, nombre, empresa, ciudad, edad, intereses.
- Si el canal principal de venta sera email, WhatsApp, llamada, formulario o Shopify.
- Si se hara remarketing con Meta/Google.
- Si se usara CRM externo.
- Si el sitio tendra newsletter, lista de espera, demo o cotizacion.
- Si se vendera a consumidores finales, colegios, padres de familia o empresas.

---

## 8. Decisiones preliminares sugeridas

- Empezar por formularios de contacto y compra con consentimiento granular.
- Mantener separadas las finalidades: operacion, soporte, marketing y publicidad.
- Evitar cualquier captacion basada en scraping o bases de terceros.
- No activar herramientas de remarketing hasta documentar banner, politica y flujo de consentimiento.
- Guardar evidencia de cada autorizacion desde el primer dia.

---

## 9. Plantilla para nuevas iteraciones

```md
## Iteracion X - Nombre del mecanismo

**Nivel de riesgo:** Bajo | Medio | Alto
**Uso:** Descripcion corta

### Como funcionaria

### Base legal o criterio de cumplimiento

### Riesgos

### Decision recomendada

### Cambios de producto requeridos
```

---

## 10. Referencias oficiales verificadas el 2026-03-09

- Ley 1581 de 2012 (SUIN): https://www.suin-juriscol.gov.co/clp/contenidos.dll/Leyes/1684507
- Portal de proteccion de datos personales de la SIC: https://www.sic.gov.co/tema/proteccion-de-datos-personales/que-hacemos
- Aviso de privacidad de la SIC como referencia de estructura informativa: https://www.sic.gov.co/ley-de-proteccion-de-datos
- Concepto/boletin SIC sobre autorizacion y finalidad: https://www.sic.gov.co/boletin-juridico-abril-2017/los-responsables-del-tratamiento-de-los-datos-personales
- Actuacion SIC sobre uso de datos de fuentes publicas sin autorizacion: https://www.sic.gov.co/boletin/juridico/habeas-data/el-tratamiento-de-datos-personales-obtenidos-trav%C3%A9s-de-p%C3%A1ginas-p%C3%BAblicas-de-consulta-exige-autorizaci%C3%B3n
- Sancion SIC por prospeccion comercial sin autorizacion previa, expresa e informada (publicada 2025-10-29): https://sedeelectronica.sic.gov.co/comunicado/la-sic-sanciona-movistar-por-tratamiento-indebido-de-datos-personales-con-fines-de-prospeccion-comercial
