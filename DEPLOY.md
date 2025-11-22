# Despliegue

## Genera el tag del release

Actualiza `package.json` y `package-lock.json` con la nueva versión. `1.0.0 <=> major.minor.patch`

```bash
# Versión beta
npm version preminor --preid=beta --no-git-tag-version

# Versión final
npm version minor --no-git-tag-version
```

Generar el changelog

```bash
npx -y -p conventional-changelog-cli -p conventional-changelog-conventionalcommits conventional-changelog -p conventionalcommits -i CHANGELOG.md -s -r 0 --config ./changelog.config.cjs
```

Crear el commit del changelog con la nueva versión

```bash
git add CHANGELOG.md package.json package-lock.json
git commit -m 'docs(changelog): actualiza a la versión 1.2.0-beta.0'
```

Crear el tag

```bash
git tag -a v1.2.0-beta.0 -m "Release v1.2.0-beta.0"
```

Guardamos los cambios en la nube

```bash
git push
git push --tags
```

## Publica en el registro de NPM

Autenticarse en npm (solo es necesario la primera vez que se publica un paquete).

```bash
npm login
```

Ahora si, publicamos la nueva versión.

```bash
npm publish --access public
```
