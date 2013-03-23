var express = require('express'),
  app = express(),
  port = 3000;

app.configure(function () {
  app.use('/', express.static(__dirname + '/example'));
  app.use('/js', express.static(__dirname + '/js'));
});

exports = module.exports = function (port) {
  return app.listen(port, function () {
      console.log('Starting the HTTP server on port ' + port + ' in ' + app.settings.env + ' mode.');
  });
};

if(require.main === module) {
  exports(3000);
}