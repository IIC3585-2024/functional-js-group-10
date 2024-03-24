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

  //Renderizado
  const htmlRenderedContainer = document.getElementById("html-rendered");
  htmlRenderedContainer.innerHTML = htmlText;
  console.log("htmlRender:", htmlTextContainer.innerHTML);
}

function markdownToHtml(markdownText) {
  const markdownLines = markdownText.split("\n");

  const htmlArray = markdownLines.reduce((htmlArray, line) => processLine(htmlArray, line), []);

  const htmlText = getHtmlText(htmlArray);
  return htmlText;
}

function processLine(htmlArray, line) {
  console.log(htmlArray, line);
  if (blank.condition(line)) {
    blank.create(htmlArray);
  } else if (code.condition(htmlArray, line)) {
    code.create(htmlArray, line);
  } else if (heading.condition(htmlArray, line)) {
    heading.create(htmlArray, line);
  } else if (unorderedList.condition(line)) {
    unorderedList.create(htmlArray, line);
  } else if (orderedList.condition(line)) {
    orderedList.create(htmlArray, line);
  } else if (link.condition(line)) {
    link.create(htmlArray, line);
  } else if (image.condition(line)) {
    image.create(htmlArray, line);
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
    content = applyInLineElements(content);

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

    line = applyInLineElements(line);

    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "paragraph") {
      lastElement.content = lastElement.content + " " + line;
    } else {
      htmlArray.push({ type: "paragraph", tag: "p", content: line });
    }
  },
};

function applyInLineElements(line) {
  line = applyLinksAndImages(line);
  line = applyEmphasis(line);
  return line;
}

function applyLinksAndImages(line) {
  const index1 = line.indexOf("[");
  const index2 = line.indexOf("](");
  const index3 = line.indexOf(")");

  if (index1 === -1 || index2 === -1 || index3 === -1 || index1 > index2 || index2 > index3 || index1 > index3) {
    return line;
  }

  const elementToCreate = line[index1 - 1] === "!" ? image : link;
  const htmlElement = objectToHtmlText(elementToCreate.createObj(line.slice(index1, index3 + 1)));

  line = line.slice(0, index1) + htmlElement + line.slice(index3 + 1);

  return applyLinksAndImages(line);
}

function applyEmphasis(line) {
  const possibleSymbols = [
    { symbol: "`", length: 2 },
    { symbol: "*", length: 3 },
  ];
  const used = [];

  possibleSymbols.forEach(({ symbol, length }) => {
    let relativeStart = 0;
    while (length > 0) {
      const substring = _.repeat(symbol, length);
      const index1 = line.indexOf(substring, relativeStart);
      const index2 = line.indexOf(substring, index1 + length);
      if (index1 === -1 || index2 === -1) {
        length--;
        relativeStart = 0;
        continue;
      }

      const indexesAreAdjacent = index2 - index1 === 1;
      const indexesAreInsideOtherEmphasis = used.some(
        ([usedIndex1, usedIndex2]) => usedIndex1 <= index1 && index2 <= usedIndex2
      );

      if (indexesAreAdjacent || indexesAreInsideOtherEmphasis) {
        relativeStart = index2;
        continue;
      }

      line =
        line.slice(0, relativeStart) +
        line.slice(relativeStart, index1) +
        emphasisSymbols[substring].start +
        line.slice(index1 + length, index2) +
        emphasisSymbols[substring].end +
        line.slice(index2 + length);

      used.push([index1, index2]);
    }
  });

  return line;
}

const emphasisSymbols = {
  "`": {
    start: "<code>",
    end: "</code>",
  },
  "``": {
    start: "<code>",
    end: "</code>",
  },
  "*": {
    start: "<em>",
    end: "</em>",
  },
  "**": {
    start: "<strong>",
    end: "</strong>",
  },
  "***": {
    start: "<em><strong>",
    end: "</strong></em>",
  },
};

const unorderedList = {
  condition(line) {
    line = line.trim();
    return line.startsWith("* ") || line.startsWith("- ") || line.startsWith("+ ");
  },
  create(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    line = line.trim();
    const entry = {
      type: "list-entry",
      tag: "li",
      content: line.slice(2, line.length),
    };

    if (lastElement && lastElement.type === "unordered-list") {
      lastElement.children.push(entry);
    } else {
      htmlArray.push({ type: "unordered-list", tag: "ul", children: [entry] });
    }
  },
};

const orderedList = {
  condition(line) {
    return line.trim().match(/^\d+\./);
  },
  create(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    line = line.trim();
    const entry = {
      type: "list-entry",
      tag: "li",
      content: line.slice(2, line.length),
    };

    if (lastElement && lastElement.type === "ordered-list") {
      lastElement.children.push(entry);
    } else {
      htmlArray.push({ type: "ordered-list", tag: "ol", children: [entry] });
    }
  },
};

const code = {
  condition(htmlArray, line) {
    return (
      this.backticksCondition(line) ||
      this.indentationCondition(htmlArray, line) ||
      this.afterCodeBlockCondition(htmlArray)
    );
  },
  backticksCondition(line) {
    return line.trimStart().startsWith("```");
  },
  indentationCondition(htmlArray, line) {
    const hasMinimumIndentation = line.startsWith(_.repeat(" ", 4));
    const lastElement = _.last(htmlArray) || {};
    const lastElementIsList = ["ordered-list", "unordered-list"].includes(lastElement.type);
    return hasMinimumIndentation && !lastElementIsList;
  },
  afterCodeBlockCondition(htmlArray) {
    const lastElement = _.last(htmlArray);
    return lastElement && lastElement.type === "code" && lastElement.open;
  },
  create(htmlArray, line) {
    if (this.backticksCondition(line)) this.initOrCloseCodeBlock(htmlArray, line);
    else if (this.indentationCondition(htmlArray, line)) this.initOrAppendToCodeBlock(htmlArray, line);
    else if (this.afterCodeBlockCondition(htmlArray)) this.appendToCodeBlock(htmlArray, line);
  },
  initOrCloseCodeBlock(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "code" && lastElement.open) {
      lastElement.open = false;
    } else {
      line = line.trim();
      line = _.trimStart(line, "```");
      htmlArray.push({ type: "code", tag: "code", open: true, content: line });
    }
  },
  initOrAppendToCodeBlock(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "code") {
      this.appendToCodeBlock(htmlArray, line);
    } else {
      line = line.trim();
      htmlArray.push({ type: "code", tag: "code", content: line });
    }
  },
  appendToCodeBlock(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    lastElement.content = lastElement.content + (lastElement.content.length ? "<br>" : "") + line.trim();
  },
};

const link = {
  condition(line) {
    return line.trim().startsWith("[") && line.includes("](");
  },
  create(htmlArray, line) {
    htmlArray.push(this.createObj(line));
  },
  createObj(line) {
    const parts = line.split("](");
    const content = parts[0].slice(1).trim();
    const url = parts[1].slice(0, -1).trim();
    return { type: "link", tag: "a", content, attributes: { href: url } };
  },
};

const image = {
  condition(line) {
    return line.trim().startsWith("![") && line.includes("](");
  },
  create(htmlArray, line) {
    htmlArray.push(this.createObj(line));
  },
  createObj(line) {
    const parts = line.split("](");
    const altText = parts[0].slice(2).trim();
    const url = parts[1].slice(0, -1).trim();
    return { type: "image", tag: "img", attributes: { src: url, alt: altText } };
  },
};

function getHtmlText(htmlArray) {
  return htmlArray.map((object) => objectToHtmlText(object)).join("\n");
}

function objectToHtmlText(obj) {
  if (obj.type === "blank") {
    return "";
  }

  let attributes = "";
  Object.entries(obj.attributes || {}).forEach(([attr, value]) => (attributes += ` ${attr}="${value}"`));

  let htmlText = `<${obj.tag}${attributes}>`;
  if (obj.content) {
    htmlText += `${obj.content}</${obj.tag}>`;
  } else if (obj.children) {
    const children = obj.children.map((child) => objectToHtmlText(child)).join("\n");
    htmlText += `\n${children}\n</${obj.tag}>`;
  }
  return htmlText;
}

main();
