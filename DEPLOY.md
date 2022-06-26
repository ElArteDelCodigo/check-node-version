# Despliegue

Autenticarse en npm (solo es necesario la primera vez que se publica un paquete).

```bash
npm login
```

Para subir una actualización antes debemos incrementar la versión:

```bash
# Registramos una mejora. [1.0.0 === major.minor.patch]
npm version patch
```

Ahora si, publicamos la nueva versión.

```bash
npm publish --access public
```
