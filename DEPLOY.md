# Despliegue

Autenticarse en npm (solo es necesario la primera vez que se publica un paquete).

```bash
npm login
```

Para subir una actualización antes debemos incrementar la versión:

```bash
# Registramos una mejora. [1.0.0 === major.minor.patch]
npm version patch

# Guardamos los cambios
git push
git push --tags
```

Ahora si, publicamos la nueva versión.

```bash
npm publish --access public
```

## Pruebas unitarias y de integración

Prerequisitos:

| Paquete         | Versión |
| --------------- | ------- |
| `node`          | 16.16.0 |
| `npm`           | 8.13.2  |
| `pm2`           | 5.2.0   |
| `yarn`          | 1.22.19 |
| `sequelize-cli` | 6.4.1   |

Ejecutar el siguiente comando:

```bash
npm run test
```
