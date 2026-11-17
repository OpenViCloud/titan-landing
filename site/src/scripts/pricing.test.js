import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vmRows, volumeRows, startingPrice } from './pricing.js';

const seedVm = [
  { id: 's', name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 170 },
  { id: 'xl', name: 'Extra Large', vcpu: 8, memoryMb: 16384, pricePerHour: 1280 },
];

test('vm rows read in vi-VN', () => {
  const rows = vmRows(seedVm, 'vi');
  assert.deepEqual(rows[0], {
    id: 's',
    name: 'Small',
    vcpu: '1',
    memory: '2 GB',
    price: '170 ₫/giờ',
    monthly: '≈ 124.100 ₫/tháng',
    featured: false,
  });
  assert.equal(rows[1].price, '1.280 ₫/giờ');
  assert.equal(rows[1].memory, '16 GB');
});

test('vm rows read in English with English separators and units', () => {
  const rows = vmRows(seedVm, 'en');
  assert.deepEqual(rows[0], {
    id: 's',
    name: 'Small',
    vcpu: '1',
    memory: '2 GB',
    price: '170 ₫/hour',
    monthly: '≈ 124,100 ₫/month',
    featured: false,
  });
  assert.equal(rows[1].price, '1,280 ₫/hour');
  assert.equal(rows[1].monthly, '≈ 934,400 ₫/month');
});

// The price is the one the meter charges, so a fractional price from the API is printed in full, never rounded
// (titan-ops features/public-site/design.md#live-pricing).
test('a fractional price is printed with every decimal the API sends', () => {
  const rows = vmRows([{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 161.388 }], 'vi');
  assert.equal(rows[0].price, '161,388 ₫/giờ');
  assert.equal(vmRows([{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 161.388 }], 'en')[0].price, '161.388 ₫/hour');
});

test('volume rows read in English', () => {
  const rows = volumeRows([{ id: 'standard', name: 'Standard', pricePerGbPerHour: 2 }], 'en');
  assert.deepEqual(rows, [{ name: 'Standard', price: '2 ₫/GB/hour', monthly: '≈ 1,460 ₫/GB/month' }]);
});

test('an unknown language reads as English', () => {
  assert.equal(vmRows(seedVm, 'fr')[0].price, '170 ₫/hour');
});

test('volume rows show the price per GB per hour', () => {
  const rows = volumeRows([{ id: 'standard', name: 'Standard', pricePerGbPerHour: 2 }], 'vi');
  assert.deepEqual(rows, [{ name: 'Standard', price: '2 ₫/GB/giờ', monthly: '≈ 1.460 ₫/GB/tháng' }]);
});

// Every input the page can't trust must give null (fallback sentence), never a row with 0 or NaN.
const untrusted = [
  ['not an array', { error: 'boom' }],
  ['empty list', []],
  ['zero price', [{ ...seedVm[0], pricePerHour: 0 }]],
  ['negative price', [{ ...seedVm[0], pricePerHour: -1 }]],
  ['price as string', [{ ...seedVm[0], pricePerHour: '170' }]],
  ['missing price', [{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048 }]],
  ['NaN price', [{ ...seedVm[0], pricePerHour: Number.NaN }]],
  ['null row', [null]],
  ['one bad row among good ones', [seedVm[0], { ...seedVm[1], pricePerHour: 0 }]],
  ['missing id', [{ name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 170 }]],
  ['empty id', [{ ...seedVm[0], id: '' }]],
];

for (const [label, input] of untrusted) {
  test(`vm rows: ${label} gives null`, () => {
    assert.equal(vmRows(input, 'en'), null);
  });
}

test('volume rows: zero price gives null', () => {
  assert.equal(volumeRows([{ name: 'Standard', pricePerGbPerHour: 0 }], 'en'), null);
});

// 634.05 × 730 is 462 856.5 exactly, but float multiplication gives 462856.49999999994.
test('monthly estimate rounds half a dong up on the decimal value', () => {
  const rows = vmRows([{ id: 'l', name: 'Large', vcpu: 4, memoryMb: 8192, pricePerHour: 634.05 }], 'vi');
  assert.equal(rows[0].monthly, '≈ 462.857 ₫/tháng');
});

test('monthly estimate keeps thousands separators for large prices', () => {
  assert.equal(vmRows(seedVm, 'vi')[1].monthly, '≈ 934.400 ₫/tháng');
});

test('no monthly line when the estimate rounds to zero', () => {
  const rows = vmRows([{ id: 's', name: 'Tiny', vcpu: 1, memoryMb: 512, pricePerHour: 0.0001 }], 'vi');
  assert.equal(rows[0].monthly, null);
  assert.equal(rows[0].price, '0,0001 ₫/giờ');
});

test('only tier m is featured', () => {
  const rows = vmRows([...seedVm, { id: 'm', name: 'Medium', vcpu: 2, memoryMb: 4096, pricePerHour: 320 }], 'en');
  assert.deepEqual(rows.map((row) => [row.id, row.featured]), [['s', false], ['xl', false], ['m', true]]);
});

test('without tier m no card is featured and the others still show', () => {
  const rows = vmRows(seedVm, 'en');
  assert.equal(rows.length, 2);
  assert.equal(rows.some((row) => row.featured), false);
});

test('starting price is the cheapest hourly price', () => {
  assert.equal(startingPrice([seedVm[1], seedVm[0]], 'vi'), '170 ₫');
  assert.equal(startingPrice([seedVm[1], seedVm[0]], 'en'), '170 ₫');
});

test('starting price is null when the data cannot be trusted', () => {
  assert.equal(startingPrice([], 'en'), null);
  assert.equal(startingPrice([{ ...seedVm[0], pricePerHour: 0 }], 'en'), null);
});

