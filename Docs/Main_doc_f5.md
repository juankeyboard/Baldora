# Documento Maestro de Ingeniería: Sistema de Onboarding

| Campo | Valor |
|-------|-------|
| **Versión** | 5.3 |
| **Fecha** | 16 de Diciembre, 2025 |
| **Proyecto** | Baldora |
| **Módulo** | Experiencia de Usuario (UX) / Onboarding |
| **Estado** | ✅ Implementado (Solo Menú - 3 Etapas) |

---

## 1. Visión General

El sistema de **Onboarding** guía al usuario en la configuración inicial de Baldora de forma rápida y concisa en **solo 3 etapas**.

---

## 2. Tour de Onboarding (3 Etapas)

| Paso | Elemento DOM | Título | Descripción |
|------|--------------|--------|-------------|
| 1 | `.logo-section` | 🎉 ¡Bienvenido a Baldora! | Presentación del juego |
| 2 | `.config-form-content` | ⚙️ Configura tu Sesión | Nickname + Modo de juego |
| 3 | `.factors-selection-container` | 🔢 Diseña tu Matriz y ¡A jugar! | Selección de tablas + Iniciar |

- **Disparador:** Primera carga de la página
- **Persistencia:** `baldora_tour_config_seen` en localStorage

---

## 3. Configuración Técnica

| Aspecto | Valor |
|---------|-------|
| Librería | Driver.js v1.0+ |
| Opacidad Overlay | 15% |
| Etapas | 3 |

---

## 4. Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 5.0 | 15/12/2025 | Implementación inicial |
| 5.1 | 16/12/2025 | Tours reducidos a solo menú |
| 5.2 | 16/12/2025 | Tour condensado a 4 etapas |
| 5.3 | 16/12/2025 | **Tour reducido a 3 etapas** |

---

*Última actualización: 16 de Diciembre, 2025*