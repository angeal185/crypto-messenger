
const config = {
  app_path: location.href,
  crypt_order: ['TWOFISH', 'AES', 'SERPENT'],
  email: 'xcrypto-cryptomail@protonmail.ch',
  box: 'https://jsonbox.io',
  rss: 'https://cdn.jsdelivr.net/gh/angeal185/crypto-messenger/rss/news.xml',
  max_len: 2048,
  pad_max: 20,
  auth_worker: {
    src: location.href + 'auth_worker.js',
    interval: 10800000
  },
  hash: 'SHA3-512',
  del_arr: ['charmander', 'mewtwo', 'lapras'],
  cipher_info: 'Create a Crypto key, Create a Crypto store with your Crypto key, encrypt your created Crypto key, export your Crypto key, share it and its password securely to a friend. All messages are encrypted or decrypted 3 times with 3 defferent ciphers securely in your or their browser providing an excessive level of end to end encryption. If you lose your Crypto key, you lose your Crypto box and it\'s messages.',
  otp_info: 'Create a Crypto key, Create a Crypto store with your Crypto key, encrypt your created Crypto key, export your Crypto key, share it and its password securely to a friend. All messages are encrypted or decrypted 3 times with 3 defferent ciphers securely in your or their browser providing an excessive level of end to end encryption. If you lose your Crypto key, you lose your Crypto box and it\'s messages.'
}

export { config }
