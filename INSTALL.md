# Guía mínima para contribuidores ✨

Guía breve para preparar entorno y probar cambios (no es para usuarios finales).

## 🔧 Requisitos

| Herramienta    | Versión | Alcance |
| -------------- | ------: | :-----: |
| Node           | 22.19.0 | global  |
| npm            |  10.9.3 | global  |
| yarn           | 1.22.22 | global  |
| pm2            |   6.0.8 | global  |
| sequelize-cli  |   6.6.3 | global  |

Comprobar versiones:
```bash
node -v && npm -v && yarn -v && pm2 -v && sequelize --version
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
