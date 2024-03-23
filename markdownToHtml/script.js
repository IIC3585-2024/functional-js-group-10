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
  console.log(htmlArray, line);
  if (blank.condition(line)) {
    blank.create(htmlArray);
  } else if (code.condition(htmlArray, line)) {
    console.log("CREATING CODE");
    code.create(htmlArray, line);
  } else if (heading.condition(htmlArray, line)) {
    heading.create(htmlArray, line);
  } else if (unorderedList.condition(line)) {
    unorderedList.create(htmlArray, line);
  } else if (orderedList.condition(line)) {
    orderedList.create(htmlArray, line);
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
      this.afterBlockCodeCondition(htmlArray)
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
  afterBlockCodeCondition(htmlArray) {
    const lastElement = _.last(htmlArray);
    return lastElement && lastElement.type === "code" && lastElement.open;
  },
  create(htmlArray, line) {
    if (this.backticksCondition(line)) this.initOrCloseBlockCode(htmlArray, line);
    else if (this.indentationCondition(htmlArray, line)) this.initOrCloseBlockCode(htmlArray, line);
    else if (this.afterBlockCodeCondition(htmlArray)) this.appendToBlockCode(htmlArray, line);
  },
  initOrCloseBlockCode(htmlArray, line) {
    console.log("initializing block code");
    const lastElement = _.last(htmlArray);
    if (lastElement && lastElement.type === "code" && lastElement.open) {
      lastElement.open = false;
    } else {
      line = line.trim();
      line = _.trimStart(line, "```");
      htmlArray.push({ type: "code", tag: "code", open: true, content: line });
    }
  },
  appendToBlockCode(htmlArray, line) {
    const lastElement = _.last(htmlArray);
    lastElement.content = lastElement.content + "\n" + line.trim();
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
