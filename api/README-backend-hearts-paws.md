### 📦 Entorno estándar para el proyecto `backend-hearts-paws`

> ✅ Usa este entorno como base para alinear todos los entornos de desarrollo antes de integrar nuevas ramas o dependencias como `auth0`.

---

#### 🟢 Versiones principales

| Herramienta / Paquete        | Versión     |
|-----------------------------|-------------|
| **Node.js**                 | `v20.11.1`  |
| **npm**                     | `10.2.4`    |
| **NestJS CLI**              | `11.0.7`    |
| **NestJS Core**             | `11.1.3`    |
| **NestJS Common**           | `11.1.3`    |
| **RxJS**                    | `7.8.2`     |
| **TypeScript**              | `5.8.3`     |

---

#### 📁 Dependencias clave en `package.json`

```json
{
  "@nestjs/core": "11.1.3",
  "@nestjs/common": "11.1.3",
  "@nestjs/cli": "11.0.7",
  "@nestjs/config": "4.0.2",
  "@nestjs/platform-express": "11.1.3",
  "rxjs": "7.8.2",
  "typescript": "5.8.3",
  "prisma": "6.9.0",
  "@prisma/client": "6.9.0"
}
```

---

#### 📌 Recomendaciones para el equipo

1. **Crear archivo `.nvmrc` con la versión de Node:**

   ```bash
   echo "v20.11.1" > .nvmrc
   ```

2. **Usar `nvm` para establecer la versión correcta:**

   ```bash
   nvm use
   ```

3. **Eliminar `node_modules` y lockfiles si hay conflictos:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Antes de hacer `merge` de alguna rama que uso dependencias**
   - Asegurarse de que los cambios de dependencias estén controlados.
   - Hacer merge de solo `package.json` y `package-lock.json` si es necesario para probar primero compatibilidad.
   - Ejecutar pruebas y validaciones básicas con `npm run start:dev` y `npm run test`.