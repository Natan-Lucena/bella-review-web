// Utility functions ported over from an older internal library while we
// migrate off it — kept as close to the original implementation as possible
// for this first pass, cleanup to follow in a later PR.
//
// Names kept identical to the source library so call sites migrate without
// a rename pass.

export function dedupeNumbers(items: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < items.length; i++) {
    if (result.indexOf(items[i]) === -1) {
      result.push(items[i]);
    }
  }
  return result;
}

export function findMax(items: number[]): number {
  let max = items[0];
  for (let i = 1; i < items.length; i++) {
    if (items[i] > max) {
      max = items[i];
    }
  }
  return max;
}

export function findMin(items: number[]): number {
  let min = items[0];
  for (let i = 1; i < items.length; i++) {
    if (items[i] < min) {
      min = items[i];
    }
  }
  return min;
}

export function sumValues(items: number[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i];
  }
  return total;
}

export function averageValue(items: number[]): number {
  if (items.length === 0) {
    return 0; // Or throw an error, depending on desired behavior for empty input
  }
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i];
  }
  return total / items.length;
}

export function flattenArrays(arrays: number[][]): number[] {
  const result: number[] = [];
  for (let i = 0; i < arrays.length; i++) {
    for (let j = 0; j < arrays[i].length; j++) {
      result.push(arrays[i][j]);
    }
  }
  return result;
}

export function countTruthy(items: unknown[]): number {
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i]) {
      count = count + 1;
    }
  }
  return count;
}

export function removeFalsy(items: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i]) {
      result.push(items[i]);
    }
  }
  return result;
}

export function reverseArray(items: number[]): number[] {
  const result: number[] = [];
  for (let i = items.length - 1; i >= 0; i--) {
    result.push(items[i]);
  }
  return result;
}

export function containsValue(items: number[], target: number): boolean {
  let found = false;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) {
      found = true;
    }
  }
  return found;
}

export function countOccurrences(items: number[], target: number): number {
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) {
      count = count + 1;
    }
  }
  return count;
}

export function joinWithComma(items: string[]): string {
  let result = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      result = result + ", ";
    }
    result = result + items[i];
  }
  return result;
}

export function capitalizeWords(words: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    result.push(capitalized);
  }
  return result;
}

export function findIndexOfFirstNegative(items: number[]): number {
  let index = -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i] < 0 && index === -1) {
      index = i;
    }
  }
  return index;
}

export function cloneShallow<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result as T;
}

export function mergeObjects<T extends Record<string, unknown>>(a: T, b: T): T {
  const result: Record<string, unknown> = {};
  for (const key in a) {
    result[key] = a[key];
  }
  for (const key in b) {
    result[key] = b[key];
  }
  return result as T;
}

export function findDuplicateStrings(items: string[]): string[] {
  const duplicates: string[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i] === items[j] && duplicates.indexOf(items[i]) === -1) {
        duplicates.push(items[i]);
      }
    }
  }
  return duplicates;
}

export function chunkPairs(items: number[]): number[][] {
  const result: number[][] = [];
  let pair: number[] = [];
  for (let i = 0; i < items.length; i++) {
    pair.push(items[i]);
    if (pair.length === 2) {
      result.push(pair);
      pair = [];
    }
  }
  if (pair.length > 0) {
    result.push(pair);
  }
  return result;
}

export function sumEvenNumbers(items: number[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] % 2 === 0) {
      total = total + items[i];
    }
  }
  return total;
}

export function toUniqueSortedNumbers(items: number[]): number[] {
  const seen: number[] = [];
  for (let i = 0; i < items.length; i++) {
    if (seen.indexOf(items[i]) === -1) {
      seen.push(items[i]);
    }
  }
  seen.sort(function (a, b) {
    return a - b;
  });
  return seen;
}

export function buildIndexMap(items: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < items.length; i++) {
    map[items[i]] = i;
  }
  return map;
}

// touch
