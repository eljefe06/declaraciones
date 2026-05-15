# ROLLBACK_POINT — Feature: admin soft delete declaraciones

## Fecha y hora del backup manual
2026-05-15 09:21:15 PDT (16:21:15 UTC)

## Ruta absoluta del backup local
~/backups-sideclara/pre-soft-delete-2026-05-15/mongo_srv1254764_2026-05-15_092115.archive.gz

Tamaño verificado: 92K (coincide con dump size reportado por el script)

## Conteos verificados del log (backup manual pre-cambio)
- users:         55 documentos
- declaraciones: 55 documentos
- users_dec:     52 documentos

(Crecimiento coherente respecto al backup del 2026-05-09: 46/36/28)

## SHA commits pre-feature
- Backend (master):  e814e5081f5eaadd16fb97ce0db43067ef73602e
- Frontend (master): 5c5a96517f2be14ffabbd184152f9faffee8edbc

## Branch activo
master (ambos repos)

## Comando para verificar integridad del backup local
file ~/backups-sideclara/pre-soft-delete-2026-05-15/mongo_srv1254764_2026-05-15_092115.archive.gz

## Comando de restauración (SOLO EN EMERGENCIA — ver ROLLBACK_PLAN.md)
scp ~/backups-sideclara/pre-soft-delete-2026-05-15/mongo_srv1254764_2026-05-15_092115.archive.gz root@31.220.58.97:/tmp/
# Luego ver Escenario 3 en ROLLBACK_PLAN.md
