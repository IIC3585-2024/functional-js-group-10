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

  const htmlArray = markdownLines.reduce((htmlArray, line) => processLine(htmlArray, line), []);

  const htmlText = getHtmlText(htmlArray);
  return htmlText;
}

function processLine(html, line) {
  line = line.trim();
  if (blank.condition(line)) {
    blank.create(html);
  } else if (heading.condition(html, line)) {
    heading.create(html, line);
  } else if (list.condition(line)) {
    list.create(html, line);
  } else {
    paragraph.create(html, line);
  }
  return html;
}

const blank = {
  condition(line) {
    return line.trim() === "";
  },
  create(html) {
    html.push({ type: "blank" });
  },
};

const heading = {
  condition(html, line) {
    return this.defaultCondition(line) || this.underlineCondition(html, line);
  },
  defaultCondition(line) {
    return line.startsWith("#");
  },
  underlineCondition(html, line) {
    if (!line.length) {
      return;
    }

    const lastElement = _.last(html);
    if (!lastElement || lastElement.type !== "paragraph") {
      return;
    }

    return line === _.repeat("=", line.length) || line === _.repeat("-", line.length); // If its a line of only '=' create h1, if its only '-' create h2
  },
  create(html, line) {
    if (this.defaultCondition(line)) this.createDefault(html, line);
    else if (this.underlineCondition(html, line)) this.createUnderline(html, line);
  },
  createDefault(html, line) {
    const level = _.takeWhile(line, (char) => char === "#").length;
    const content = _.trimStart(line, "# ");
    html.push({ type: "heading", tag: "h" + level, content });
  },
  createUnderline(html, line) {
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
  create(html, line) {
    const content = _.trimStart(line, "* ");
    html.push({ type: "list", tag: "li", content });
  },
};

const paragraph = {
  create(html, line) {
    const lastElement = _.last(html);
    if (lastElement && lastElement.type === "paragraph") {
      lastElement.content = lastElement.content + " " + line;
    } else {
      html.push({ type: "paragraph", tag: "p", content: line });
    }
  },
};

function getHtmlText(html) {
  return html
    .map((line) => {
      if (line.type === "blank") return "";
      else return `<${line.tag}>${line.content}</${line.tag}>`;
    })
    .join("\n");
}

main();
