import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripLinks } from './links.js';

test('a Markdown link keeps its words and loses its address', () => {
  assert.equal(stripLinks('Giá xem ở [bảng giá](/vi/#pricing).'), 'Giá xem ở bảng giá.');
});

test('an autolink and a bare address are dropped', () => {
  assert.equal(stripLinks('See <https://github.com/OpenViCloud/titan-cli> now'), 'See now');
  assert.equal(stripLinks('Download from https://github.com/x/releases/latest and run it'), 'Download from and run it');
});

test('an image link is dropped with its address', () => {
  assert.equal(stripLinks('Look ![logo](https://x/logo.png) here'), 'Look here');
});

test('code blocks and inline code keep every address', () => {
  const answer = 'Install:\n\n```bash\ncurl -fsSL https://openvicloud.com/install.sh | sh\n```\n\nor run `curl https://x/y`.';
  assert.equal(stripLinks(answer), answer);
});

test('a www address and an HTML link are dropped; the brand name stays', () => {
  assert.equal(stripLinks('Go to www.openvicloud.com/docs now'), 'Go to now');
  assert.equal(stripLinks('Click <a href="https://x.y">here</a> please'), 'Click here please');
  assert.equal(stripLinks('OpenViCloud (openvicloud.com) is a cloud'), 'OpenViCloud (openvicloud.com) is a cloud');
});

test('a Markdown link whose address holds parentheses leaves no stray text', () => {
  assert.equal(stripLinks('See [a](https://x/(t)) end'), 'See a end');
});

test('an email address is dropped', () => {
  assert.equal(stripLinks('Write to support@openvicloud.com today'), 'Write to today');
});

test('text with no link is unchanged', () => {
  assert.equal(stripLinks('OpenViCloud có 4 kích thước VM.\n\n- Small'), 'OpenViCloud có 4 kích thước VM.\n\n- Small');
});
