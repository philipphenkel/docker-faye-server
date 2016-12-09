let forbidWildcardSubscriptionOnRoot = {
  incoming: function(message, callback) {
    if (message.channel === '/meta/subscribe') {
      if (message.subscription === '/*' || message.subscription === '/**') {
        message.error = 'Wildcard subscription on root is forbidden';
      }
    }
    callback(message);
  }
}

module.exports = {forbidWildcardSubscriptionOnRoot};
