var fakeCommandsInstance = {
  client: {
    reply: (message, text) => Promise.resolve(`@${message.author}, ${text}`),
    sendMessage: (channel, text) => Promise.resolve(text),
    user: {
      username: 'testbot',
    },
  },
};

module.exports = {
  commands: fakeCommandsInstance,
};
