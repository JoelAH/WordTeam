import { Filter } from 'bad-words';

// Create a filter instance with custom options
const filter = new Filter({
  placeHolder: '*',
  regex: /[A-Za-z0-9가-힣_]/g,
  replaceRegex: /[A-Za-z0-9가-힣가-힣_]/g,
});

// Add custom words to the filter
filter.addWords(
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'cunt', 'damn', 'hell',
  'bastard', 'whore', 'slut', 'twat', 'wank', 'piss', 'tits', 'boobs', 'nude', 'naked',
  'sex', 'xxx', 'porn', 'erotic', 'adult', 'nsfw'
);

/**
 * Check if a nickname contains inappropriate content
 * @param nickname The nickname to validate
 * @returns boolean true if the nickname is appropriate, false otherwise
 */
export function isAppropriateNickname(nickname: string): boolean {
  if (!nickname) return false;
  
  // Check if the nickname contains any inappropriate words
  return !filter.isProfane(nickname);
}

/**
 * Synchronous version for client-side validation
 * @param nickname The nickname to validate
 * @returns boolean true if the nickname is appropriate, false otherwise
 */
export function isAppropriateNicknameSync(nickname: string): boolean {
  if (!nickname) return false;
  
  const lowercaseNickname = nickname.toLowerCase();
  
  // Check if the nickname contains any inappropriate words
  return !filter.isProfane(lowercaseNickname);
} 