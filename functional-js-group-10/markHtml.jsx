import React, { useState } from 'react';
import lod from 'lodash';
import './markHtml.css';

// Función para convertir Markdown a HTML.
const markdownToHtml = markdown => {
    // Separamos cada linea de texto para procesarla
    const lines = markdown.split('\n');
    // Se mapea cada linea 
    // metodo de lodas trim elimina espacios blancos al inicio y final de una cadena de texto
    // metodo trimStart hace lo mismo que trim pero solo al comienzo
    // Estos metodos se usan para eliminar componentes HTML una vez que se procesó
    const htmlLines = lod.map(lines, line => {
        line = line.trim();
        if (line.startsWith('#')) {
            const level = lod.takeWhile(line, char => char === '#').length;
            const content = lod.trimStart(line, '# ');
            return `<h${level}>${content}</h${level}>`;
        } else if (line.startsWith('* ')) {
            const content = lod.trimStart(line, '* ');
            return `<li>${content}</li>`;
        } else if (lod.trim(line) === '') {
            return '';
        } else {
            return `<p>${line}</p>`;
        }
    });
    return htmlLines.join('\n');
  };

function MarkdownEditor() {
let [markdownText, setMarkdownText] = useState('');
let [htmlText, setHtmlText] = useState('');

let handleMarkdownChange = (event) => {
    setMarkdownText(event.target.value);
};

let convertToHtml = () => {
    let html = markdownToHtml(markdownText);
    console.log(html);
    setHtmlText(html);
};

return (
    <div className="markdown-editor-container">
        <div className="editor-section">
        <h3>Editor de Markdown</h3>
        <textarea
            value={markdownText}
            onChange={handleMarkdownChange}
            rows={10}
            cols={50}
        />
        <br />
        <button onClick={convertToHtml}>Convertir a HTML</button>
        </div>
        <div className="result-section">
        <h3>HTML Resultante</h3>
        <div className="html-result">{htmlText}</div>
        </div>
    </div>
    );
}

export default MarkdownEditor;

  
 /* // Ejemplo de uso
  const markdownText = `
  # Título 1
  
  Esto es un párrafo.
  
  * Lista 1
  * Lista 2
  * Lista 3
  
  ## Título 2
  
  Otro párrafo.
  `;
  
  const htmlText = markdownToHtml(markdownText);
  console.log(htmlText);*/



  // Código con ayuda de ChatGpt