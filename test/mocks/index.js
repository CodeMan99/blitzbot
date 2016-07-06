var fakeCommandsInstance = {
  client: {
    reply: (message, text) => Promise.resolve(`@${message.author}, ${text}`),
    sendMessage: (channel, text) => Promise.resolve(text),
    user: {
      id: '0101',
      username: 'testbot',
    },
  },
};

module.exports = {
  commands: fakeCommandsInstance,
};
