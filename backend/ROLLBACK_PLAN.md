# ROLLBACK_PLAN — Feature: admin soft delete declaraciones

## Cuándo usar este plan

Si el botón "Eliminar declaración" causa errores en producción y necesitas revertir,
elige el escenario según la gravedad.

---

## Escenario 1 — Revertir solo el código (no se usó la función aún)

Usa este escenario si el despliegue falla o la función nunca llegó a ejecutarse.
No toca la base de datos.

### Backend (VPS: /root/sistema-declaraciones/SistemaDeclaraciones_backend)

```bash
# Volver al SHA pre-feature
git checkout e814e5081f5eaadd16fb97ce0db43067ef73602e -- \
  src/db/schemas/declaracion.ts \
  src/db/repositories/declaracion_repo.ts \
  src/db/repositories/stats_repo.ts \
  src/graphql/resolvers/declaracion.ts \
  src/graphql/schemas/mutation.graphql \
  src/types/output/declaraciones.ts

# Reconstruir imagen y reiniciar
cd /root/sistema-declaraciones
docker compose build backend
docker compose up -d backend
```

### Frontend (VPS: /root/sistema-declaraciones/SistemaDeclaraciones_frontend)

```bash
git checkout 5c5a96517f2be14ffabbd184152f9faffee8edbc -- \
  src/api/declaracion/mutations.ts \
  src/app/admin/declaraciones/declaraciones.component.ts \
  src/app/admin/declaraciones/declaraciones.component.html

# Reconstruir imagen y reiniciar
cd /root/sistema-declaraciones
docker compose build frontend
docker compose up -d frontend
```

**Tiempo estimado:** 5-10 minutos.
**Impacto en datos:** Ninguno.
**Verificación:** Entra al panel `/admin/declaraciones` — el botón no debe aparecer.

---

## Escenario 2 — Recuperar declaraciones marcadas como eliminadas (soft delete recovery)

Usa este escenario si una o varias declaraciones fueron eliminadas por error.
**No se pierde información** — solo se limpia `deletedAt` y `deletedBy`.

### Recuperar una declaración específica

```bash
# Entrar al contenedor de MongoDB
docker exec -it sideclara_mongodb mongosh -u <MONGO_USER> -p <MONGO_PASS> --authenticationDatabase admin sideclara

# En el shell de MongoDB:
# Verificar que existe y está marcada como eliminada
db.declaraciones.findOne({ _id: ObjectId("ID_DE_LA_DECLARACION") })

# Revertir el soft delete
db.declaraciones.updateOne(
  { _id: ObjectId("ID_DE_LA_DECLARACION") },
  { $set: { deletedAt: null, deletedBy: null } }
)

# Confirmar
db.declaraciones.findOne(
  { _id: ObjectId("ID_DE_LA_DECLARACION") },
  { deletedAt: 1, deletedBy: 1, tipoDeclaracion: 1 }
)
```

### Recuperar TODAS las declaraciones eliminadas en un período

```js
// Listar primero para confirmar
db.declaraciones.find(
  { deletedAt: { $ne: null } },
  { _id: 1, tipoDeclaracion: 1, deletedAt: 1, deletedBy: 1 }
).pretty()

// Solo después de confirmar el listado:
db.declaraciones.updateMany(
  { deletedAt: { $ne: null } },
  { $set: { deletedAt: null, deletedBy: null } }
)
```

**Tiempo estimado:** 2-5 minutos.
**Impacto en código:** Ninguno — el código no requiere cambios.
**Verificación:** Las declaraciones deben reaparecer en el panel `/admin/declaraciones`.

---

## Escenario 3 — Restauración completa desde backup (emergencia)

Usa este escenario SOLO si hay corrupción grave de datos y el Escenario 2 no es suficiente.
**ESTO SOBREESCRIBE TODA LA BASE DE DATOS** — se pierden todos los cambios posteriores al backup.

### Datos del backup pre-feature

| Campo           | Valor                                                                 |
|-----------------|-----------------------------------------------------------------------|
| Fecha           | 2026-05-15 09:21:15 PDT (16:21:15 UTC)                               |
| Archivo local   | ~/backups-sideclara/pre-soft-delete-2026-05-15/mongo_srv1254764_2026-05-15_092115.archive.gz |
| Conteos         | users: 55, declaraciones: 55, users_dec: 52                         |

### Pasos de restauración

```bash
# 1. Transferir el backup al VPS
scp ~/backups-sideclara/pre-soft-delete-2026-05-15/mongo_srv1254764_2026-05-15_092115.archive.gz \
  root@31.220.58.97:/tmp/

# 2. En el VPS — detener servicios que usen MongoDB
ssh root@31.220.58.97
cd /root/sistema-declaraciones
docker compose stop backend

# 3. Restaurar (DESTRUCTIVO — confirma dos veces antes)
docker exec -i sideclara_mongodb mongorestore \
  --uri="mongodb://<MONGO_USER>:<MONGO_PASS>@localhost:27017/sideclara?authSource=admin" \
  --archive=/tmp/mongo_srv1254764_2026-05-15_092115.archive.gz \
  --gzip \
  --drop

# 4. Verificar conteos
docker exec -it sideclara_mongodb mongosh -u <MONGO_USER> -p <MONGO_PASS> \
  --authenticationDatabase admin sideclara \
  --eval "print('users:', db.users.countDocuments(), 'declaraciones:', db.declaraciones.countDocuments(), 'users_dec:', db.usersdecs.countDocuments())"
# Esperado: users: 55, declaraciones: 55, users_dec: 52

# 5. Revertir el código al SHA pre-feature (ver Escenario 1)

# 6. Reiniciar todos los servicios
docker compose up -d
```

**Tiempo estimado:** 15-30 minutos.
**Impacto en datos:** Se pierden TODOS los cambios posteriores al 2026-05-15 09:21 PDT.
**Cuándo llamar al titular:** Antes del paso 3.

---

## Contacto de emergencia

Ver credenciales de MongoDB en `/root/sistema-declaraciones/.env` (variable `MONGO_*`).
Credenciales del VPS: ver acceso SSH configurado en `~/.ssh/config` local.

## Referencias

- Backup point: `ROLLBACK_POINT.md`
- Backend pre-feature SHA: `e814e5081f5eaadd16fb97ce0db43067ef73602e`
- Frontend pre-feature SHA: `5c5a96517f2be14ffabbd184152f9faffee8edbc`
