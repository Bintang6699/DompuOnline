const f = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
console.log('15000 =>', 'Rp. ' + f.format(15000));
console.log('5000  =>', 'Rp. ' + f.format(5000));
console.log('100000=>', 'Rp. ' + f.format(100000));
console.log('15    =>', 'Rp. ' + f.format(15));
console.log('50    =>', 'Rp. ' + f.format(50));
console.log('100   =>', 'Rp. ' + f.format(100));
