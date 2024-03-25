El código se encuentra dentro de la carpeta `/markdownToHtml`.

Para probarlo, es necesario servir el archivo `index.html`. Proponemos dos métodos:
- Teniendo `python` instalado, dentro de la carpeta `/markdownToHtml`, correr el comando `python -m http.server`.
- Utilizando la extensión "Live Server" de VSCode, realizando click derecho a `index.html` y seleccionando "Open with Live Server".

A continuación, ofrecemos un markdown de prueba, para utilizar en la página con los elementos que logramos traducir a `html`.

---

# Markdown de prueba \+!!!

Este es un párrafo de texto normal.

---

\#Esto no es un título

## Encabezado 2

Esto es otro párrafo.

Este título está generado por tener símbolos = abajo
==

Este subtítulo por tener símbolos -- abajo
------------------------------------------

- Lista no ordenada elemento 1
- Lista no ordenada elemento 2
- Lista no ordenada elemento 3

1. Lista ordenada elemento 1
1. Lista ordenada elemento 2
    - Lista identada no ordenada elemento 1
    - Lista identada no ordenada elemento 2
    1. Lista identada ordenada elemento 1
    3. Lista identada ordenada elemento 2
1. Lista ordenada elemento 3

Texto en **negrita**

Texto en *cursiva*

Texto en ***negrita y cursiva***


Acá hay código in line: `console.log("Hello World!")`

```
# esto es un bloque de código entre símbolos ```
string = "Hello World!"
console.log(string)
```
A continuación hay código que está identado

    # codigo identado
    console.log("Hello World!")

### Links e Imagenes

[Enlace a Google](https://www.google.com)

![Texto alternativo para la imagen](image.webp)
