const times = Array.from({ length: 150000 }, () => Math.random() * 5000);
let max = -Infinity;
for (let i = 0; i < times.length; i++) {
  if (times[i] > max) max = times[i];
}
console.log(max);
