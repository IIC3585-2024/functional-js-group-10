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
  const htmlTextContainer = document.getElementById("html-text");
  htmlTextContainer.textContent = htmlText;
}

function markdownToHtml(markdownText) {
  const markdownLines = markdownText.split("\n");

  const htmlArray = markdownLines.reduce((htmlArray, line) => processLine(htmlArray, line), []);

  const htmlText = getHtmlText(htmlArray);
  return htmlText;
}

function processLine(htmlArray, line) {
  if (blank.condition(line)) {
    blank.create(htmlArray);
  } else if (heading.condition(htmlArray, line)) {
    heading.create(htmlArray, line);
  } else if (list.condition(line)) {
    list.create(htmlArray, line);
  } else {
    paragraph.create(htmlArray, line);
  }
  return htmlArray;
}

const blank = {
  condition(line) {
    return line.trim() === "";
  },
  create(htmlArray) {
    htmlArray.push({ type: "blank" });
  },
};

const heading = {
  condition(htmlArray, line) {
    line = line.trim();
    return this.defaultCondition(line) || this.underlineCondition(htmlArray, line);
  },
  defaultCondition(line) {
    if (!line.startsWith("#")) {
      return;
    }

    const level = _.takeWhile(line, (char) => char === "#").length;
    return level >= 1 && level <= 6 && line[level] === " ";
  },
  underlineCondition(htmlArray, line) {
    if (!line.length) {
      return;
    }

    const lastElement = _.last(htmlArray);
    if (!lastElement || lastElement.type !== "paragraph") {
      return;
    }

    return line === _.repeat("=", line.length) || line === _.repeat("-", line.length); // If its a line of only '=' create h1, if its only '-' create h2
  },
  create(htmlArray, line) {
    if (this.defaultCondition(line)) this.createDefault(htmlArray, line);
    else if (this.underlineCondition(htmlArray, line)) this.createUnderline(htmlArray, line);
  },
  createDefault(htmlArray, line) {
    const level = _.takeWhile(line, (char) => char === "#").length;
    const content = _.trimStart(line, "# ");
    htmlArray.push({ type: "heading", tag: "h" + level, content });
  },
  createUnderline(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    const content = lastElement.content;
    const level = line[0] === "=" ? 1 : 2; // If its a line of only '=' create h1, if its only '-' create h2
    htmlArray.pop();
    htmlArray.push({ type: "heading", tag: "h" + level, content });
  },
};

const list = {
  condition(line) {
    return line.startsWith("* ");
  },
  create(htmlArray, line) {
    const content = _.trimStart(line, "* ");
    htmlArray.push({ type: "list", tag: "li", content });
  },
};

const paragraph = {
  create(htmlArray, line) {
    const trailingSpaces = _.takeRightWhile(line, (char) => char === " ").length;
    line = line.trim();
    if (trailingSpaces >= 2) {
      line = line + "<br>";
    }

    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "paragraph") {
      lastElement.content = lastElement.content + " " + line;
    } else {
      htmlArray.push({ type: "paragraph", tag: "p", content: line });
    }
  },
};

function getHtmlText(htmlArray) {
  return htmlArray
    .map((line) => {
      if (line.type === "blank") return "";
      else return `<${line.tag}>${line.content}</${line.tag}>`;
    })
    .join("\n");
}

main();
