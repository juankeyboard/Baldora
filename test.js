const times = Array.from({ length: 150000 }, () => Math.random() * 5000);
console.log(Math.max(...times));
