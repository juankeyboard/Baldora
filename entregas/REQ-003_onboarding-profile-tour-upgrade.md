# REQ-003: Mejoras al Onboarding - Tour de Perfil y Boton de Ayuda

> Generado por: web_requirements_agent
> Fecha: 2026-03-16
> Proyecto: Baldora
> Estado: Listo para implementacion

---

## 1. Resumen Ejecutivo

Dos mejoras al sistema de onboarding (Driver.js) en la vista de perfil de usuario:

1. **Nuevo paso en el tour de perfil** que explica el badge de liga comunitaria (`.community-badge`), el calculo del score y el sistema de ligas.
2. **Activacion del boton flotante "?"** en la vista PROFILE, actualmente oculto con `display: none`.

---

## 2. User Stories

### US-001: Paso explicativo del badge de comunidad en el tour de perfil

**Como** usuario de Baldora,
**quiero** que el tour de perfil me explique que significa el badge de liga y como se calcula mi posicion,
**para que** entienda como mejorar mi ranking en la comunidad.

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|-------------|
| 1 | Al ejecutar el tour de perfil, se muestra un 5to paso que resalta el elemento `.community-badge` | El popover aparece sobre el badge de liga |
| 2 | El titulo y la descripcion estan en espanol (clave `es`) e ingles (clave `en`) | Cambiar idioma y repetir el tour; los textos cambian correctamente |
| 3 | La descripcion explica las 3 metricas (consistencia, velocidad, precision) y los 6 niveles de liga con sus rangos de percentil | Leer el texto y verificar que contiene toda la informacion |
| 4 | El nuevo paso se inserta despues de `.profile-stats-grid` (paso 2) y antes de `.profile-filters` (paso 3 actual) | Navegar el tour y confirmar el orden: Perfil > Metricas > Badge Comunidad > Filtros > Historial |
| 5 | El popover se posiciona correctamente sin solaparse con otros elementos | Probar en desktop (1920x1080) y mobile (375x812) |
| 6 | El localStorage key `baldora_tour_profile_seen` sigue funcionando: primera visita lanza tour automatico, visitas posteriores no | Limpiar localStorage, visitar perfil, verificar tour auto. Recargar, verificar que no se repite |

---

### US-002: Activar boton flotante "?" en la vista de perfil

**Como** usuario de Baldora,
**quiero** ver el boton flotante "?" cuando estoy en mi perfil,
**para que** pueda volver a ver el tour de perfil cuando lo necesite.

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|-------------|
| 1 | Al navegar a la vista PROFILE, el boton `#btn-help-tour` se muestra (`display: flex`) | Inspeccionar el DOM; el boton es visible |
| 2 | Al presionar el boton, se ejecuta `Onboarding.replayTour('profile')` | Click en "?" y verificar que el tour de perfil inicia desde el paso 1 |
| 3 | Al navegar fuera de PROFILE (a CONFIG, PLAYING, etc.), el boton conserva su comportamiento original en cada vista | Cambiar entre vistas y verificar que el boton no queda vinculado al tour equivocado |
| 4 | El boton no interfiere con el layout de la vista de perfil en ninguna resolucion | Probar en desktop y mobile |

---

## 3. Especificacion de Textos para el Nuevo Paso del Tour

### 3.1 Espanol (clave `es`)

**Clave de titulo:** `onboarding.profile.t5`
**Valor:**
```
Tu Posicion en la Comunidad
```

**Clave de descripcion:** `onboarding.profile.d5`
**Valor:**
```
Este badge muestra tu liga y posicion entre todos los jugadores de Baldora.

Tu score comunitario se calcula como el promedio de 3 metricas:
- Consistencia: que tan cerca estas de tu mejor marca personal.
- Velocidad: que tan rapido respondes comparado con el resto.
- Precision: tu porcentaje de aciertos respecto al minimo de la comunidad.

Segun tu percentil en el ranking, perteneces a una de estas ligas:
DIAMANTE (top 5%) | PLATINO (top 15%) | ORO (top 30%) | PLATA (top 50%) | BRONCE (top 70%) | MADERA (resto).

Sigue practicando para subir de liga!
```

### 3.2 Ingles (clave `en`)

**Clave de titulo:** `onboarding.profile.t5`
**Valor:**
```
Your Community Position
```

**Clave de descripcion:** `onboarding.profile.d5`
**Valor:**
```
This badge shows your league and position among all Baldora players.

Your community score is calculated as the average of 3 metrics:
- Consistency: how close you are to your personal best.
- Speed: how fast you respond compared to everyone else.
- Accuracy: your correct answer rate relative to the community minimum.

Based on your ranking percentile, you belong to one of these leagues:
DIAMOND (top 5%) | PLATINUM (top 15%) | GOLD (top 30%) | SILVER (top 50%) | BRONZE (top 70%) | WOOD (rest).

Keep practicing to climb the ranks!
```

---

## 4. Instrucciones Tecnicas de Implementacion

### 4.1 Archivo: `js/i18n.js`

**Accion:** Agregar 2 nuevas claves de traduccion en ambos idiomas.

- En el bloque `es` (aprox. linea 142, despues de `onboarding.profile.d4`):
  - Agregar `'onboarding.profile.t5'` con el titulo en espanol (seccion 3.1).
  - Agregar `'onboarding.profile.d5'` con la descripcion en espanol (seccion 3.1).

- En el bloque `en` (aprox. linea 284, despues de `onboarding.profile.d4`):
  - Agregar `'onboarding.profile.t5'` con el titulo en ingles (seccion 3.2).
  - Agregar `'onboarding.profile.d5'` con la descripcion en ingles (seccion 3.2).

---

### 4.2 Archivo: `js/onboarding.js` -- Funcion `startProfileTour()` (lineas 121-166)

**Accion:** Insertar un nuevo paso en el array de `setSteps()`, en la posicion 3 (indice 2), entre el paso de `.profile-stats-grid` y el de `.profile-filters`.

**Nuevo paso a insertar:**
```javascript
{
    element: '.community-badge',
    popover: {
        title: t('onboarding.profile.t5'),
        description: t('onboarding.profile.d5'),
        side: 'top',
        align: 'center'
    }
}
```

**Orden resultante de los 5 pasos:**
1. `.profile-user-info` (t1/d1)
2. `.profile-stats-grid` (t2/d2)
3. `.community-badge` (t5/d5) -- NUEVO
4. `.profile-filters` (t3/d3)
5. `.profile-table-wrapper` (t4/d4)

> Nota: Las claves se nombran t5/d5 (no t3/d3) para no renumerar las claves i18n existentes. La posicion visual en el tour es independiente del numero de clave.

---

### 4.3 Archivo: `js/app.js` -- Bloque `case 'PROFILE':` (lineas 318-321)

**Accion:** Reemplazar el bloque actual:

```javascript
case 'PROFILE':
    if (profileView) profileView.classList.add('active');
    if (helpBtn) helpBtn.style.display = 'none';
    break;
```

**Por:**

```javascript
case 'PROFILE':
    if (profileView) profileView.classList.add('active');
    if (helpBtn) {
        helpBtn.onclick = () => Onboarding.replayTour('profile');
        helpBtn.style.display = 'flex';
    }
    break;
```

**Cambios concretos:**
- Se remueve `helpBtn.style.display = 'none'`.
- Se asigna `helpBtn.onclick` para ejecutar `Onboarding.replayTour('profile')`.
- Se establece `helpBtn.style.display = 'flex'` (consistente con el patron del caso CONFIG).

---

### 4.4 Instrucciones para el Responsive Agent

No se anticipan problemas de layout porque:
- El boton `#btn-help-tour` ya tiene estilos responsivos definidos en `css/styles.css` (clase `.floating-btn`).
- El badge `.community-badge` ya existe y esta posicionado en el layout de perfil.
- Driver.js maneja automaticamente el posicionamiento del popover segun el viewport.

**Verificaciones requeridas:**
1. En viewports menores a 480px, verificar que el popover del paso `.community-badge` no se corte o desborde. Si ocurre, considerar cambiar `side: 'top'` por `side: 'bottom'` condicionalmente o dejarlo en `side: 'left'`.
2. Verificar que el boton flotante "?" no se superponga con el contenido del badge de comunidad en mobile.
3. Confirmar que el scroll automatico de Driver.js posicione correctamente el badge en la vista antes de mostrar el popover (el badge puede estar fuera del viewport inicial en mobile).

---

## 5. Archivos Afectados

| Archivo | Tipo de cambio |
|---------|---------------|
| `js/i18n.js` | Agregar 4 claves nuevas (t5/d5 en es y en) |
| `js/onboarding.js` | Insertar 1 paso nuevo en `startProfileTour()` |
| `js/app.js` | Modificar case PROFILE en switch de vistas |

---

## 6. Riesgos y Consideraciones

- **No hay riesgo de regresion** en el tour de configuracion; los cambios son exclusivos del tour de perfil.
- **La descripcion del paso 5 es larga.** Si visualmente ocupa demasiado espacio en mobile, se puede acortar eliminando la lista de ligas y dejando un texto como "Segun tu percentil, se te asigna una liga desde Madera hasta Diamante."
- **Compatibilidad i18n:** Las claves t5/d5 siguen la convencion existente (t1-t4, d1-d4). No hay conflicto.
