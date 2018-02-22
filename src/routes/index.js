
let init = (app) => {

  app.get('/api/hello', function (req, res) {
    res.send('world');
  });

  app.use('/api/r', require('./r')());

};

module.exports.init = init;
