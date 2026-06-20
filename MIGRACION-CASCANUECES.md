# Cascanueces → proyecto propio de Firebase

Pasaje del gestor del proyecto compartido `asg-digital` a un proyecto de
Firebase **solo de Cascanueces**, con **login real** (email + contraseña) y
**reglas cerradas** (solo entra quien está logueado).

> El proyecto viejo `asg-digital` **no se toca**: queda intacto como respaldo
> hasta que confirmes que el nuevo anda.

---

## Lo que ya quedó hecho en el código (rama `claude/sweet-newton-mez9ve`)

- Saqué el **PIN** y puse **Firebase Auth (email + contraseña)** con pantalla
  de login. La sesión queda recordada (no te lo pide cada vez).
- En **Configuración → Acceso** ahora se ve con qué email entraste y hay un
  botón **Cerrar sesión**.
- El **firebaseConfig del proyecto nuevo** está en UN solo lugar marcado en
  `index.html` (buscá `PEGÁ ACÁ EL DEL PROYECTO NUEVO`).
- `firestore.rules`: reglas cerradas (requieren login).
- `migrar-datos.mjs`: script que copia los datos del viejo al nuevo.

## Cuántos datos hay que mover (los conté en la base)

| Colección | Registros |
|---|---|
| productos | 3 |
| ventas | 10 |
| clientes | 1 |
| entregas | 3 |
| caja / egresos / espera / encargos / cuenta | 0 |
| **config** | 1 doc |
| **TOTAL** | **17 registros + config** |

---

## Lo que SOLO podés hacer vos (en la consola) — con valores

1. **Crear el proyecto nuevo** en https://console.firebase.google.com
   (sugerencia de nombre: `cascanueces-gestion`).
2. Adentro, **agregá una app web** (ícono `</>`) y copiá el `firebaseConfig`.
3. **Pegá ese config en 2 lugares**:
   - `index.html` → bloque marcado `PEGÁ ACÁ EL DEL PROYECTO NUEVO`.
   - `migrar-datos.mjs` → `CFG_NUEVO`.
4. **Authentication → empezar → Email/Password → Activar.**
5. **Authentication → Users → agregar usuario** (creá 2):
   - mamá: su email + contraseña.
   - vos (Anto): tu email + contraseña.
6. **Migrar los datos** (en esta carpeta):
   ```bash
   npm init -y && npm i firebase
   export CASC_EMAIL="tu-email-del-paso-5"
   export CASC_PASS="tu-contraseña"
   node migrar-datos.mjs
   ```
7. **Probar el login** con la app apuntando al proyecto nuevo. Entrá, revisá
   que estén los productos, ventas, etc.
8. **Recién cuando todo ande**, publicar las reglas cerradas:
   `Firestore → Rules` → pegar el contenido de `firestore.rules` → Publicar.

> ⚠️ No publiques las reglas cerradas antes del paso 7, o te quedás afuera.

---

## Nota sobre el Backup a Google Drive (opcional)

La app tiene backup a Drive. Ese botón usa un *Client ID* de Google que estaba
atado al proyecto viejo. Si querés seguir usándolo, hay que generar un Client ID
nuevo en el Google Cloud del proyecto nuevo y pegarlo en Configuración. No es
necesario para la migración (de eso se encarga `migrar-datos.mjs`).
