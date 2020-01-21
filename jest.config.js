
module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  coverageReporters: [
    'lcov',
    'text'
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    '(.*.spec).(jsx?|tsx?)$'
  ]
}
