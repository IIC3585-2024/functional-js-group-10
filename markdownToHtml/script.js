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
  } else if (unorderedList.condition(line)) {
    unorderedList.create(htmlArray, line);
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

const unorderedList = {
  condition(line) {
    line = line.trim();
    return line.startsWith("* ");
  },
  create(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    const entry = {
      type: "list-entry",
      tag: "li",
      content: _.trimStart(line, "* "),
    };

    if (lastElement && lastElement.type === "unordered-list") {
      lastElement.children.push(entry);
    } else {
      htmlArray.push({ type: "unordered-list", tag: "ul", children: [entry] });
    }
  },
};

function getHtmlText(htmlArray) {
  return htmlArray.map((object) => objectToHtmlText(object)).join("\n");
}

function objectToHtmlText(obj) {
  if (obj.type === "blank") {
    return "";
  } else if (obj.children) {
    const children = obj.children.map((child) => objectToHtmlText(child)).join("\n");
    return `<${obj.tag}>\n${children}\n</${obj.tag}>`;
  } else if (obj.content) {
    return `<${obj.tag}>${obj.content}</${obj.tag}>`;
  }
}

main();
