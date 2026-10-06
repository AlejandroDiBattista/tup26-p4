function quicksort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const menores = arr.filter((valor) => valor < pivot);
  const iguales = arr.filter((valor) => valor === pivot);
  const mayores = arr.filter((valor) => valor > pivot);

  return [...quicksort(menores), ...iguales, ...quicksort(mayores)];
}

module.exports = quicksort;
