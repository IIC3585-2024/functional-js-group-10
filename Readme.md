Hay 2 códigos. Una primera aproximación que hicimos era ver línea por línea y convertir a html, esto se encuentra en la carpeta functional-js-group-10.

La segunda aproximación y versión final en la que trabajamos se encuentra en la carpeta markdownToHtml. En esta se considera una estructura de "hijos" (pues dentro de un elemento markdown pueden haber otros). Para probarla se recomienda utilizar la extensión "Live server" de VSCode, dentro de la carpeta y del archivo index.html. A continuación dejamos un texto de prueba en el que se aprecian las fucniones realizadas, este se debe copiar y pegar de input en la vista que genera el live server:


# Markdown de prueba \+!!!

Este es un párrafo de texto normal.

---

\#Esto no es un título

## Encabezado 2

Esto es otro párrafo.

- Lista no ordenada elemento 1
- Lista no ordenada elemento 2
- Lista no ordenada elemento 3

1. Lista ordenada elemento 1
2. Lista ordenada elemento 2
3. Lista ordenada elemento 3

**Texto en negrita**

*Texto en cursiva*

[Enlace a Google](https://www.google.com)

![Texto alternativo para la imagen](image.webp)

Una línea en blanco arriba y abajo.