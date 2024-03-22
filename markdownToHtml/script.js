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

    return line === _.repeat("=", line.length) || line === _.repeat("-", line.length);
  },
  create(htmlArray, line) {
    if (this.defaultCondition(line)) this.createDefault(htmlArray, line);
    else if (this.underlineCondition(htmlArray, line)) this.createUnderline(htmlArray, line);
  },
  createDefault(htmlArray, line) {
    const level = _.takeWhile(line, (char) => char === "#").length;
    let content = _.trimStart(line, "# ");
    content = applyEmphasis(content);

    htmlArray.push({ type: "heading", tag: "h" + level, content });
  },
  createUnderline(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    const content = lastElement.content;
    const level = line[0] === "=" ? 1 : 2;
    htmlArray.pop();
    htmlArray.push({ type: "heading", tag: "h" + level, content });
  },
};

const paragraph = {
  create(htmlArray, line) {
    const trailingSpaces = _.takeRightWhile(line, (char) => char === " ").length;
    line = line.trim();
    if (trailingSpaces >= 2) {
      line = line + "<br>";
    }

    line = applyEmphasis(line);

    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "paragraph") {
      lastElement.content = lastElement.content + " " + line;
    } else {
      htmlArray.push({ type: "paragraph", tag: "p", content: line });
    }
  },
};

function applyEmphasis(line) {
  let length = 3;
  let relativeStart = 0;
  while (length > 0) {
    console.log("emphasis", line);

    const index1 = line.indexOf(_.repeat("*", length), relativeStart);
    const index2 = line.indexOf(_.repeat("*", length), index1 + length);
    if (index1 === -1 || index2 === -1) {
      length--;
      relativeStart = 0;
      continue;
    }

    if (index2 - index1 === 1) {
      relativeStart = index2;
      continue;
    }

    line =
      line.slice(0, relativeStart) +
      line.slice(relativeStart, index1) +
      emphasis[length].start +
      line.slice(index1 + length, index2) +
      emphasis[length].end +
      line.slice(index2 + length);
  }

  return line;
}

const emphasis = {
  1: {
    start: "<em>",
    end: "</em>",
  },
  2: {
    start: "<strong>",
    end: "</strong>",
  },
  3: {
    start: "<em><strong>",
    end: "</strong></em>",
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

function getHtmlText(htmlArray) {
  return htmlArray
    .map((line) => {
      if (line.type === "blank") return "";
      else return `<${line.tag}>${line.content}</${line.tag}>`;
    })
    .join("\n");
}

main();
