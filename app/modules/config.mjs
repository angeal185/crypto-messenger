
const config = {
  app_path: location.href,
  crypt_order: ['TWOFISH', 'AES', 'SERPENT'],
  email: 'xcrypto-cryptomail@protonmail.ch',
  box: 'https://jsonbox.io',
  rss: 'https://cdn.jsdelivr.net/gh/angeal185/crypto-messenger/rss/news.xml',
  auth_worker: {
    src: location.href + 'auth_worker.js',
    interval: 10800000
  },
  hash: 'SHA3-512'
}

export { config }
