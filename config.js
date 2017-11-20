module.exports = exports = {
  quarters: {
    key: process.env.QUARTERS_KEY || 'Lpk5sPrA7P59HFlN7obS',
    secret:
      process.env.QUARTERS_SECRET ||
      'uwwh5snunvk5mmhgtyar3fpohtf2u4trhwynjmr3ol5r6hhujopdf8',
    webSecret:
      process.env.QUARTERS_WEBSECRET || '1s4x2v8h3b9ollw1pt2afj8knheamvmvv',
    address:
      process.env.QUARTERS_ADDRESS ||
      '0xcd7e451d500ddb6b22d2648f4e66fb4bf8999629',
    quartersURL:
      process.env.QUARTERS_URL || 'https://dev.pocketfulofquarters.com',
    apiURL:
      process.env.QUARTERS_API_URL ||
      'https://api.dev.pocketfulofquarters.com/v1/'
  }
}
