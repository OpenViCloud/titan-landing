// The assistant never sends a visitor anywhere (titan-ops features/public-site/design.md#chat-assistant): free models
// add links even when the prompt forbids them, so links (Markdown, HTML), http(s) and www addresses and email addresses
// leave the answer here. A bare domain such as the brand's own name stays. Code keeps every address: an install
// command is part of the answer, not a place to go.

const CODE = /(```[\s\S]*?```|`[^`\n]*`)/;
// The (address) of a Markdown link, which may itself hold one pair of parentheses.
const TARGET = String.raw`\((?:[^()\s]|\([^()\s]*\))*\)`;

function stripText(text) {
  return text
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(new RegExp(`!\\[[^\\]]*\\]${TARGET}`, 'g'), '')
    .replace(new RegExp(`\\[([^\\]]*)\\]${TARGET}`, 'g'), '$1')
    .replace(/<https?:\/\/[^>\s]+>/g, '')
    .replace(/https?:\/\/[^\s)>\]]+/g, '')
    .replace(/\bwww\.[^\s)>\]]+/g, '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]*\w/g, '')
    .replace(/(\S) {2,}(?=\S)/g, '$1 ');
}

export function stripLinks(answer) {
  return answer
    .split(CODE)
    .map((part, i) => (i % 2 === 1 ? part : stripText(part)))
    .join('');
}
