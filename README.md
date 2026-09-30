# Catálogo de piezas para presentaciones web

Catálogo de recursos para montar presentaciones web con el estilo de Inmaker: animaciones, modificadores, componentes, adornos, colores, tipografía y transiciones. Cada pieza tiene un código corto (A1, C7, X3…) para poder pedirla por su nombre.

Todas las fichas son la pieza real funcionando, no una imagen: el botón **Repetir** vuelve a lanzar su animación.

## Verlo

Abre `catalogo.html` con un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

y entra en <http://localhost:8000/catalogo.html>. La presentación de ejemplo está en <http://localhost:8000/Ejemplo/>.

## Qué hay

| Carpeta / archivo | Contenido |
| --- | --- |
| `catalogo.html` | El catálogo, organizado por secciones (A, M, C, D, K, F, T, X) |
| `css/theme.css` | Tema oscuro para Reveal.js: colores, tipografías y componentes |
| `js/anim.js` | Animaciones de entrada sobre GSAP |
| `js/fx.js` | Efectos de la sección X, todavía sin usar en ninguna presentación |
| `assets/` | Logo de Inmaker e imagen de muestra |
| `Ejemplo/` | Presentación de 5 diapositivas hecha con estas piezas que enseña lo que puede hacer Reveal.js: fragmentos, código resaltado por pasos, diapositivas verticales con Auto-Animate, fórmulas y una calculadora interactiva |

Depende de [GSAP](https://gsap.com) (se carga desde jsDelivr) y de las fuentes Chakra Petch, Inter y JetBrains Mono de Google Fonts.

## Licencia

Puedes usar, copiar y modificar todos los recursos del repositorio con licencia [MIT](LICENSE), **salvo el logo de Inmaker** (`assets/logo-inmaker.png`), que no está incluido en la licencia: si montas tu propia presentación, sustitúyelo por el tuyo.
