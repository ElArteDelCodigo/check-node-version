# check-node-version

Verifica que la versión de node sea la correcta cuando se levanta una aplicación de node.

Puede verificar las siguientes aplicaciones: `node`, `npm` y `yarn` las cuales deben ser especificadas en el archivo `package.json`.

## Instalación

```bash
npm install -g @elartedelcodigo/check-node-version
```

## Ejemplo:

Si en el archivo `package.json` tenemos la siguiente configuración:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  ...
  "engines": {
    "node": "^16",
    "npm": "^8"
  }
}
```

**Nota.-** Para utilizar la versión correcta puede consultar [https://www.npmjs.com/package/semver](https://www.npmjs.com/package/semver)

Luego desde la raiz del proyecto ejecutamos el siguiente comando:

```bash
check-node-version
```

Resultado si tenemos activada la versión correcta de node:

```bash
node: 16.13.2
npm: 8.12.1
```

en caso contrario:

```bash
node: 12.22.7 (versión requerida: ^16)
npm: 6.14.17 (versión requerida: ^8)
```
