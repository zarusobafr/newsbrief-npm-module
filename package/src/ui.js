const readline = require("readline/promises");

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = c("1");
const dim = c("2");
const cyan = c("36");
const yellow = c("33");
const red = c("31");
const green = c("32");

let rl;
function getRl() {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on("SIGINT", () => {
      console.log("\n  👋 Bye!\n");
      process.exit(0);
    });
  }
  return rl;
}

async function ask(question) {
  try {
    return (await getRl().question(question)).trim();
  } catch {
    return "exit"; // stdin closed
  }
}

function closeInput() {
  if (rl) rl.close();
}

function wrap(text, width, indent = "") {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.map((l) => indent + l).join("\n");
}

function spinner(label) {
  if (!process.stderr.isTTY) return { stop() {} };
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const t = setInterval(() => {
    process.stderr.write(`\r  ${cyan(frames[i++ % frames.length])} ${label}`);
  }, 80);
  return {
    stop() {
      clearInterval(t);
      process.stderr.write("\r\x1b[K");
    },
  };
}

function printWelcome() {
  console.log(`\n  ${bold("⚡ newsbrief")} ${dim("— the last 24 hours, any genre, in 10 bullets")}\n`);
}

function printNews(genre, items) {
  const width = Math.min(process.stdout.columns || 80, 100) - 6;
  console.log(`\n  ${bold(yellow("Top " + items.length))} ${bold("· " + genre)} ${dim("· last 24h")}\n`);
  for (const it of items) {
    console.log(`  ${green("•")} ${bold(wrap(it.headline, width, "").replace(/\n/g, "\n    "))}`);
    console.log(wrap(it.summary, width, "    "));
    if (it.source) console.log(`    ${dim("↳ " + it.source)}`);
    console.log();
  }
}

module.exports = { ask, closeInput, spinner, printWelcome, printNews, bold, dim, cyan, yellow, red, green };
