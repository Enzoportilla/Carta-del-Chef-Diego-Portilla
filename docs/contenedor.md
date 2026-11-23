# Trabajar con Claude Code dentro del contenedor

El proyecto incluye un **dev container** (`.devcontainer/`) con Node.js 22, Git, GitHub CLI
y Claude Code ya instalados. Así todo corre aislado en Linux, sin instalar nada en Windows
salvo Docker y VS Code.

## Requisitos (una sola vez, en Windows)
1. **Docker Desktop** (con WSL 2 activado): https://www.docker.com/products/docker-desktop/
2. **VS Code**: https://code.visualstudio.com/
3. Extensión **Dev Containers** de VS Code (`ms-vscode-remote.remote-containers`).

## Paso previo (una sola vez): renombrar la carpeta
La configuración viene en la carpeta `devcontainer` (sin punto). Renómbrala a **`.devcontainer`**
(con punto al inicio). En PowerShell, dentro de la carpeta del proyecto:
```powershell
Rename-Item devcontainer .devcontainer
```
(En el Explorador de Windows también funciona: clic derecho → Cambiar nombre → `.devcontainer`.)

## Abrir el proyecto en el contenedor
1. Abre Docker Desktop y espera a que diga *Engine running*.
2. En VS Code: **Archivo → Abrir carpeta…** → `C:\Users\enzob\Claude Projects\Carta Chef Diego Portilla`.
3. Aparecerá el aviso **"Reopen in Container"** → haz clic.
   (O `Ctrl+Shift+P` → *Dev Containers: Reopen in Container*.)
4. La primera vez tarda unos minutos en construirse.

## Iniciar Claude Code
- Abre la terminal integrada (`Ctrl+ñ` o `Ctrl+\``) y ejecuta:
  ```bash
  claude
  ```
- La primera vez te pedirá iniciar sesión. Si el navegador no logra devolver la sesión al
  contenedor, copia el código que muestra el navegador y pégalo en la terminal.
- También puedes usar el panel de la extensión de Claude Code en VS Code (corre dentro del contenedor).

La sesión de Claude se guarda en un volumen de Docker, así que **no tendrás que volver a
iniciar sesión** al reconstruir el contenedor.

## Qué hay en el contenedor
| Elemento | Detalle |
|---|---|
| Sistema | Debian Bookworm (Linux) |
| Node.js | 22 + npm |
| Herramientas | git, gh (GitHub CLI), Claude Code |
| Carpeta de trabajo | `/workspace` (es tu carpeta de Windows, sincronizada) |
| Puertos reenviados | 5173 (Vite), 3000 (app/API), 4173 (preview), 8080 (estático) |
| Zona horaria | America/Santiago |

`node_modules` vive en un volumen aparte para que las instalaciones sean rápidas y no
ensucien la carpeta de Windows.

## Problemas comunes
- **"Docker is not running"** → abre Docker Desktop antes de VS Code.
- **Cambié `devcontainer.json`** → `Ctrl+Shift+P` → *Dev Containers: Rebuild Container*.
- **Quiero salir del contenedor** → `Ctrl+Shift+P` → *Dev Containers: Reopen Folder Locally*.

## Seguridad
El contenedor aísla el proyecto de tu equipo, pero lo que esté dentro (incluida la sesión
de Claude) es accesible para el código que se ejecute ahí. Si algún día usas
`claude --dangerously-skip-permissions`, hazlo solo con código de confianza.
