# check-node-version

Verifica que la versión de node sea la correcta cuando se levanta una aplicación.

Puede verificar cualquiera de las siguientes aplicaciones:

- `node`
- `npm`
- `yarn`
- `pm2`
- `sequelize`

las cuales deben ser especificadas en el archivo `package.json`.

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
  "engines": {
    "node": "^16",
    "npm": "^8"
  }
}
```

**Nota.-** Para utilizar la versión correcta puede consultar [https://www.npmjs.com/package/semver](https://www.npmjs.com/package/semver)

Luego desde la raíz del proyecto ejecutamos el siguiente comando:

```bash
check-node-version
```

Resultado si tenemos instalada la versión correcta:

```bash
my-project: 1.0.0
node: 16.15.1 ✓  versión requerida: ^16
npm:   8.12.2 ✓  versión requerida: ^8

Parece que todo está en orden, continuemos...

```

en caso contrario:

```bash
my-project: 1.0.0
node: 14.18.3 ✕  versión requerida: ^16
npm:   7.24.2 ✕  versión requerida: ^8

¡Ups! no podemos continuar.

Asegúrate de tener instalada la versión correcta e inténtalo nuevamente.

Ejemplo:

    - para instalar node: nvm install 16.15.1   (https://github.com/nvm-sh/nvm)
    - para instalar npm:  npm install -g npm@8.12.2

Comprueba la versión:

    node -v
    npm -v

```

Y en el caso de no encontrarse dentro de la carpeta correcta:

```bash

¡Ups! ¿estamos dentro del proyecto?

Si es así, puedes especificar la versión requerida de:

  - node
  - npm
  - yarn
  - pm2
  - sequelize

dentro del archivo package.json

Ejemplo:

    {
      "name": "my-project",
      "version": "1.0.0",
      "engines": {
        "node": "^16",
        "npm": "^8"
      }
    }

Formatos válidos (revisar el método satisfies):

    https://github.com/npm/node-semver#usage

```
