const { escapeRegex, MAX_SEARCH_LENGTH } = require('../../controllers/projectController');

describe('Unit: escapeRegex & Search Boundaries', () => {
  test('MAX_SEARCH_LENGTH constant is 100', () => {
    expect(MAX_SEARCH_LENGTH).toBe(100);
  });

  test('escapes all special regex metacharacters correctly', () => {
    const input = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(input);
    expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  test('preserves standard alphanumeric text unchanged', () => {
    const input = 'Nexus Platform Redesign 2026';
    expect(escapeRegex(input)).toBe('Nexus Platform Redesign 2026');
  });

  test('escapes parentheses and dots in version numbers', () => {
    const input = '(v1.0.4)';
    expect(escapeRegex(input)).toBe('\\(v1\\.0\\.4\\)');
  });

  test('escapes bracketed tags', () => {
    const input = '[Urgent] Security';
    expect(escapeRegex(input)).toBe('\\[Urgent\\] Security');
  });

  test('escapes quantifiers and alternation symbols', () => {
    const input = 'a+b*c?|d';
    expect(escapeRegex(input)).toBe('a\\+b\\*c\\?\\|d');
  });

  test('escapes catastrophic ReDoS nested quantifier pattern', () => {
    const input = '((a+)+)+$';
    const escaped = escapeRegex(input);
    expect(escaped).toBe('\\(\\(a\\+\\)\\+\\)\\+\\$');
    // When instantiated into RegExp, it matches literal string without exponential backtracking
    const re = new RegExp(escaped);
    expect(re.test('((a+)+)+$')).toBe(true);
    expect(re.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaa!')).toBe(false);
  });
});

