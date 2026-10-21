import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vmRows, volumeRows, startingPrice } from './pricing.js';

const seedVm = [
  { id: 's', name: 'Small', cpu: 0.5, vcpu: 1, memoryMb: 2048, pricePerHour: 161.388 },
  { id: 'xl', name: 'Extra Large', cpu: 4, vcpu: 8, memoryMb: 16384, pricePerHour: 1268.1 },
];

test('vm rows keep every decimal and read in vi-VN', () => {
  const rows = vmRows(seedVm, 'vi');
  assert.deepEqual(rows[0], {
    id: 's',
    name: 'Small',
    vcpu: '1',
    memory: '2 GB',
    price: '161,388 ₫/giờ',
    monthly: '≈ 117.813 ₫/tháng',
    featured: false,
  });
  assert.equal(rows[1].price, '1.268,1 ₫/giờ');
  assert.equal(rows[1].memory, '16 GB');
});

test('vm rows read in English with English separators and units', () => {
  const rows = vmRows(seedVm, 'en');
  assert.deepEqual(rows[0], {
    id: 's',
    name: 'Small',
    vcpu: '1',
    memory: '2 GB',
    price: '161.388 ₫/hour',
    monthly: '≈ 117,813 ₫/month',
    featured: false,
  });
  assert.equal(rows[1].price, '1,268.1 ₫/hour');
  assert.equal(rows[1].monthly, '≈ 925,713 ₫/month');
});

test('volume rows read in English', () => {
  const rows = volumeRows([{ id: 'standard', name: 'Standard', sizeGb: 0, isCustomized: true, pricePerGbPerHour: 1.57914 }], 'en');
  assert.deepEqual(rows, [{ name: 'Standard', price: '1.57914 ₫/GB/hour', monthly: '≈ 1,153 ₫/GB/month' }]);
});

test('an unknown language reads as English', () => {
  assert.equal(vmRows(seedVm, 'fr')[0].price, '161.388 ₫/hour');
});

test('volume rows show the price per GB per hour', () => {
  const rows = volumeRows([{ id: 'standard', name: 'Standard', sizeGb: 0, isCustomized: true, pricePerGbPerHour: 1.57914 }], 'vi');
  assert.deepEqual(rows, [{ name: 'Standard', price: '1,57914 ₫/GB/giờ', monthly: '≈ 1.153 ₫/GB/tháng' }]);
});

// Every input the page can't trust must give null (fallback sentence), never a row with 0 or NaN.
const untrusted = [
  ['not an array', { error: 'boom' }],
  ['empty list', []],
  ['zero price', [{ ...seedVm[0], pricePerHour: 0 }]],
  ['negative price', [{ ...seedVm[0], pricePerHour: -1 }]],
  ['price as string', [{ ...seedVm[0], pricePerHour: '161.388' }]],
  ['missing price', [{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048 }]],
  ['NaN price', [{ ...seedVm[0], pricePerHour: Number.NaN }]],
  ['null row', [null]],
  ['one bad row among good ones', [seedVm[0], { ...seedVm[1], pricePerHour: 0 }]],
  ['missing id', [{ name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 161.388 }]],
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
  assert.equal(vmRows(seedVm, 'vi')[1].monthly, '≈ 925.713 ₫/tháng');
});

test('no monthly line when the estimate rounds to zero', () => {
  const rows = vmRows([{ id: 's', name: 'Tiny', vcpu: 1, memoryMb: 512, pricePerHour: 0.0001 }], 'vi');
  assert.equal(rows[0].monthly, null);
  assert.equal(rows[0].price, '0,0001 ₫/giờ');
});

test('only tier m is featured', () => {
  const rows = vmRows([...seedVm, { id: 'm', name: 'Medium', vcpu: 2, memoryMb: 4096, pricePerHour: 311.256 }], 'en');
  assert.deepEqual(rows.map((row) => [row.id, row.featured]), [['s', false], ['xl', false], ['m', true]]);
});

test('without tier m no card is featured and the others still show', () => {
  const rows = vmRows(seedVm, 'en');
  assert.equal(rows.length, 2);
  assert.equal(rows.some((row) => row.featured), false);
});

test('starting price is the cheapest hourly price', () => {
  assert.equal(startingPrice([seedVm[1], seedVm[0]], 'vi'), '161,388 ₫');
  assert.equal(startingPrice([seedVm[1], seedVm[0]], 'en'), '161.388 ₫');
});

test('starting price is null when the data cannot be trusted', () => {
  assert.equal(startingPrice([], 'en'), null);
  assert.equal(startingPrice([{ ...seedVm[0], pricePerHour: 0 }], 'en'), null);
});

