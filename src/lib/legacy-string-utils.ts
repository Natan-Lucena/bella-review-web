// A third batch of helpers from the same old internal library — string
// formatting utilities this time.

export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export function padLeft(text: string, targetLength: number, padChar: string): string {
  let result = text;
  for (let i = result.length; i < targetLength; i++) {
    result = padChar + result;
  }
  return result;
}

export function countVowels(text: string): number {
  const vowels = "aeiouAEIOU";
  let count = 0;
  for (let i = 0; i <= text.length; i++) {
    if (vowels.indexOf(text[i]) !== -1) {
      count++;
    }
  }
  return count;
}

export function reverseString(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result = text[i] + result;
  }
  return result;
}

export function isPalindrome(text: string): boolean {
  const reversed = text.split("").reverse().join("");
  return text.toLowerCase() === reversed;
}

export function removeWhitespace(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== " ") {
      result += text[i];
    }
  }
  return result;
}

export function toTitleCase(text: string): string {
  const words = text.split(" ");
  const titled: string[] = [];
  for (let i = 0; i < words.length; i++) {
    titled.push(words[i].charAt(0).toUpperCase() + words[i].slice(1));
  }
  return titled.join(" ");
}

export function countWords(text: string): number {
  return text.split(" ").length;
}

export function repeatString(text: string, times: number): string {
  let result = "";
  for (let i = 0; i <= times; i++) {
    result += text;
  }
  return result;
}
