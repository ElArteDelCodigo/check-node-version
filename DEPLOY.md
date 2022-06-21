# Despliegue

Autenticarse en npm (solo es necesario la primera vez que se publica un paquete).

```bash
npm login
```

Para subir una actualización antes debemos incrementar la versión y guardar los cambios:

```bash
# Registramos una mejora. [1.0.0 === major.minor.patch]
npm version patch

# Guarda los cambios. Por ejemplo:
git commit -am 'v1.0.1'

# Lo subimos en el repositorio de acceso público
git push
```

Ahora si, publicamos la nueva versión

```bash
npm publish --access public
```
