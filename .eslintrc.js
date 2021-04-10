module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    // Environment
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Variables
    'no-unused-vars': 'off',
    // Comments
    'spaced-comment': ['error', 'always'],
    'multiline-comment-style': ['error', 'starred-block'],
    'vue/html-comment-indent': ['error', 2],
    'vue/html-comment-content-spacing': ['error', 'always'],
    'vue/html-comment-content-newline': ['error',
      {
        'singleline': 'never',
        'multiline': 'always',
      },
    ],
    // Indent
    'indent': ['error', 2],
    'vue/script-indent': ['error', 2, { 
      baseIndent: 0
    }],
    'vue/html-indent': ['error', 2, {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: []
    }],
  },
  'overrides': [
    // Disable JS indent on Vue files since it's handled by 'vue/script-indent'
    {
      'files': ['*.vue'],
      'rules': {
        'indent': 'off'
      }
    }
  ]
}
