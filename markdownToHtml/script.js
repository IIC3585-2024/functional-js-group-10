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

function markdownToHtml(markdownText) {
  const markdownLines = markdownText.split("\n");
  const html = [];

  console.log("markdownLines", markdownLines);
  markdownLines.forEach((line, index) => processOneLine(line, index, html, markdownLines));
  console.log("html", html);
  const htmlText = getHtmlText(html);
  return htmlText;
}

function processOneLine(line, index, html, originalLines) {
  line = line.trim();
  if (heading.condition(line, html)) {
    heading.create(line, html);
  } else if (list.condition(line)) {
    list.create(line, html);
  } else if (line.trim() === "") {
    return;
  } else {
    paragraph.create(line, html);
  }

  console.log("html in line", index, html);
}

const heading = {
  condition(line, html) {
    return this.defaultCondition(line) || this.underlineCondition(line, html);
  },
  defaultCondition(line) {
    return line.startsWith("#");
  },
  underlineCondition(line, html) {
    if (!line.length) {
      return;
    }

    const lastElement = _.last(html);
    if (!lastElement || lastElement.type !== "paragraph") {
      return;
    }

    return line === _.repeat("=", line.length) || line === _.repeat("-", line.length); // If its a line of only '=' create h1, if its only '-' create h2
  },
  create(line, html) {
    if (this.defaultCondition(line)) this.createDefault(line, html);
    else if (this.underlineCondition(line, html)) this.createUnderline(line, html);
  },
  createDefault(line, html) {
    const level = _.takeWhile(line, (char) => char === "#").length;
    const content = _.trimStart(line, "# ");
    html.push({ type: "heading", tag: "h" + level, content });
  },
  createUnderline(line, html) {
    const lastElement = _.last(html);
    const content = lastElement.content;
    const level = line[0] === "=" ? 1 : 2; // If its a line of only '=' create h1, if its only '-' create h2
    html.pop();
    html.push({ type: "heading", tag: "h" + level, content });
  },
};

const list = {
  condition(line) {
    return line.startsWith("* ");
  },
  create(line, html) {
    const content = _.trimStart(line, "* ");
    html.push({ type: "list", tag: "li", content });
  },
};

const paragraph = {
  create(line, html) {
    html.push({ type: "paragraph", tag: "p", content: line });
  },
};

function getHtmlText(html) {
  return html.map((line) => `<${line.tag}>${line.content}</${line.tag}>`).join("\n");
}

main();
