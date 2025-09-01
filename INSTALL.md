# Guía mínima para contribuidores ✨

Guía breve para preparar entorno y probar cambios (no es para usuarios finales).

## 🔧 Requisitos

| Herramienta   | Versión | Alcance |
| ------------- | ------: | :-----: |
| Node          | 22.19.0 | global  |
| npm           |  10.9.3 | global  |
| yarn          | 1.22.22 | global  |
| pm2           |   6.0.8 | global  |
| sequelize-cli |   6.6.3 | global  |

Comprobar versiones:

```bash
node -v && npm -v && yarn -v && pm2 -v && sequelize-cli --version
```

## 🛠️ Setup

```bash
git clone https://github.com/ElArteDelCodigo/check-node-version.git
cd check-node-version
git checkout develop
npm ci
```

## 🧪 Pruebas y uso local

Compilar y tests:

```bash
npm run build
npm test
```

## 🌍 Instalación global local (para probar en otros proyectos)

Instalación global desde la carpeta actual:

```bash
# En este repo
npm run build
npm i -g .

# Verifica la versión instalada
check-node-version --version
```

Ejemplo de uso:

```bash
# Ejecutar desde la raiz de otro proyecto
check-node-version
```

Para desinstalar la versión de prueba

```bash
# Desinstalar
npm uninstall -g @elartedelcodigo/check-node-version
```

El binario expuesto es `check-node-version` y apunta a `build/main`.

### 🔁 Importante sobre versiones de Node

- Build: realiza el build con Node 22 (ejemplo 22.19.0) para generar `build/`.

  ```bash
  nvm use 22
  npm ci
  npm run build
  ```

- Probar en otros proyectos con distintas versiones: cambia a la versión de Node que quieres validar en ese entorno y ejecuta la instalación global desde este repo (esto registra el binario en el prefijo global de esa versión de Node).

  ```bash
  # Ejemplo: probar con Node 18
  nvm use 18
  npm i -g .
  # En el otro proyecto (bajo Node 18)
  check-node-version
  ```

- Repite la instalación global para cada versión de Node que quieras cubrir (Node mantiene un prefijo global por versión/instalación).
