// What the model reads: the persona file, the customer docs of the visitor's language, the READMEs of the public
// repositories, and the prices of this moment (titan-ops features/public-site/design.md#chat-assistant). Free models
// often have no tool calling, so prices go in the prompt instead of a tool.

const RULES = `Rules, above everything else:
- Answer only from the DOCUMENTS and PRICES below. When they do not hold the answer, say plainly that you do not know. Never guess.
- No links, no email addresses, no "contact support": never send the visitor anywhere else, with one exception. To ask OpenViCloud for something (trial credit, a question the documents do not answer), the visitor opens a public issue at github.com/OpenViCloud/titan-support with the Tenant ID from the Profile page of the portal, and no personal data.
- Answer in the visitor's language (Vietnamese or English).
- Never ask for personal information.`;

function vmLine(o) {
  return `- ${o.name} (${o.id}): ${o.vcpu} vCPU, ${o.memoryMb / 1024} GB RAM, ${o.pricePerHour} VND per hour`;
}

function volumeLine(o) {
  return `- ${o.name} (${o.id}): ${o.pricePerGbPerHour} VND per GB per hour`;
}

export function pricesText(prices) {
  if (prices === null) {
    return 'Prices are not available right now. If asked about a price, say you cannot give it right now. Quote no number.';
  }
  return [
    'Prices of this moment, in VND, charged by the hour (keep every decimal):',
    'Virtual machines:',
    ...prices.vm.map(vmLine),
    'Volumes:',
    ...prices.volume.map(volumeLine),
  ].join('\n');
}

export function buildMessages({ knowledge, prices, lang, history, message }) {
  const system = [
    knowledge.persona.trim(),
    RULES,
    `PRICES:\n${pricesText(prices)}`,
    `DOCUMENTS:\n${knowledge.docs[lang]}\n${knowledge.readmes}`,
  ].join('\n\n');
  return [{ role: 'system', content: system }, ...history, { role: 'user', content: message }];
}
