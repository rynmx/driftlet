import bcrypt from "bcryptjs";

// A list of common, easy-to-remember words for passphrase generation
const wordList = [
  // Animals
  "bear",
  "wolf",
  "lion",
  "tiger",
  "eagle",
  "shark",
  "whale",
  "zebra",
  "horse",
  "panda",
  "koala",
  "camel",
  "snake",
  "mouse",
  "rabbit",
  "goose",
  "moose",
  "otter",
  "squid",
  "sloth",

  // Colors
  "blue",
  "green",
  "pink",
  "gold",
  "black",
  "white",
  "brown",
  "orange",
  "purple",
  "silver",
  "coral",
  "teal",
  "gray",
  "beige",
  "amber",
  "ruby",
  "azure",
  "olive",
  "plum",
  "indigo",

  // Simple objects
  "book",
  "door",
  "chair",
  "table",
  "lamp",
  "clock",
  "phone",
  "plate",
  "fork",
  "spoon",
  "knife",
  "pen",
  "ring",
  "shoe",
  "key",
  "bag",
  "cup",
  "box",
  "card",
  "coin",

  // Nature
  "lake",
  "tree",
  "rock",
  "river",
  "cloud",
  "rain",
  "snow",
  "wind",
  "leaf",
  "flower",
  "beach",
  "ocean",
  "moon",
  "star",
  "hill",
  "cave",
  "sand",
  "wood",
  "vine",
  "moss",

  // Adjectives
  "happy",
  "sunny",
  "swift",
  "brave",
  "quiet",
  "strong",
  "wise",
  "kind",
  "wild",
  "calm",
  "tiny",
  "huge",
  "tall",
  "short",
  "round",
  "fast",
  "slow",
  "warm",
  "cold",
  "soft",
];

/**
 * Generates a secure random passphrase
 * @param wordCount Number of words to include in the passphrase (default: 4)
 * @returns A string containing the generated passphrase
 */
export function generatePassphrase(wordCount = 4): string {
  const selectedWords: string[] = [];

  // Ensure we get unique words
  const availableWords = [...wordList];

  for (let i = 0; i < wordCount; i++) {
    if (availableWords.length === 0) break;

    // Get a random index
    const randomIndex = Math.floor(Math.random() * availableWords.length);

    // Select the word, capitalize the first letter
    const word = availableWords[randomIndex];
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);

    // Add to selected words and remove from available words
    selectedWords.push(capitalizedWord);
    availableWords.splice(randomIndex, 1);
  }

  return selectedWords.join(" ");
}

/**
 * Generates a salted hash of a passphrase
 * @param passphrase The passphrase to hash
 * @returns A promise that resolves to the hashed passphrase
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  return bcrypt.hash(passphrase, 12);
}

/**
 * Verifies if a passphrase matches its hashed version
 * @param passphrase The plaintext passphrase to check
 * @param hashedPassphrase The hashed passphrase to compare against
 * @returns A promise that resolves to true if the passphrase matches, false otherwise
 */
export async function verifyPassphrase(
  passphrase: string,
  hashedPassphrase: string,
): Promise<boolean> {
  return bcrypt.compare(passphrase, hashedPassphrase);
}
