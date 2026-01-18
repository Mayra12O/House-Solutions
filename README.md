# 🏗️ Backend - House Solutions

Este proyecto representa el **módulo backend** del sistema **House Solutions**, desarrollado en Node.js y MongoDB, que permite a los usuarios registrarse, iniciar sesión y recuperar su cuenta mediante correo electrónico.

---

## 📌 Relación con artefactos previos

- **Casos de uso**:
  - Registro de usuario
  - Inicio de sesión
  - Recuperación de contraseña
- **Historia de usuario**:
  - *"Como usuario quiero poder registrarme, iniciar sesión y recuperar mi contraseña vía correo electrónico"*
- **Modelo de clases**:
  - `Usuario` (Modelo Mongoose con validaciones y esquema definido)
- **Diseño UI**:
  - Formulario de registro, login y recuperación de contraseña según prototipo aprobado.

---

## ⚙️ Tecnologías utilizadas

- **Node.js** (runtime)
- **Express** (framework web)
- **MongoDB + Mongoose** (base de datos NoSQL)
- **Nodemailer** (envío de correos)
- **bcrypt** (hash de contraseñas)
- **JWT** (token para recuperación de cuenta)
- **dotenv** (manejo de variables de entorno)
- **CORS y Morgan** (middleware)

---

## 📁 Estructura del proyecto

