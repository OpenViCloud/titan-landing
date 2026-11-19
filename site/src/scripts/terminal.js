// A terminal output line cut into pieces, each ending at a break opportunity but the last: after a `/` that is not
// one of the two of `//`, after `?` and after `&`. The panel puts a <wbr> between pieces, so a long URL wraps at its
// separators before `overflow-wrap: anywhere` has to break it elsewhere.
export function breakSegments(line) {
  return line.split(/(?<=(?<!\/)\/(?!\/)|[?&])/);
}
