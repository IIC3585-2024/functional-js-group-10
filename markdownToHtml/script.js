function main() {
  const button = document.getElementById("markdown-to-html-button");
  if (button) {
    button.addEventListener("click", processMarkdown);
  }
}

function processMarkdown() {
  const markdownText = document.getElementById("markdown-text").value;
  const htmlText = markdownToHtml(markdownText);

  console.log("markdownText", markdownText);
  console.log("htmlText", JSON.stringify(htmlText));
  const htmlContainer = document.getElementById("html-text");
  htmlContainer.textContent = htmlText;
}

function markdownToHtml(markdown) {
  // Separamos cada linea de texto para procesarla
  const lines = markdown.split("\n");
  // Se mapea cada linea
  // metodo de lodas trim elimina espacios blancos al inicio y final de una cadena de texto
  // metodo trimStart hace lo mismo que trim pero solo al comienzo
  // Estos metodos se usan para eliminar componentes HTML una vez que se procesó
  const htmlLines = _.map(lines, (line) => {
    line = line.trim();
    if (line.startsWith("#")) {
      const level = _.takeWhile(line, (char) => char === "#").length;
      const content = _.trimStart(line, "# ");
      return `<h${level}>${content}</h${level}>`;
    } else if (line.startsWith("* ")) {
      const content = _.trimStart(line, "* ");
      return `<li>${content}</li>`;
    } else if (_.trim(line) === "") {
      return "";
    } else {
      return `<p>${line}</p>`;
    }
  });
  return htmlLines.join("\n");
}

main();
