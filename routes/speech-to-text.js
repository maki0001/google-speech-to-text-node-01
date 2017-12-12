var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('speech-to-text', { title: 'speech-to-text' });
});

module.exports = router;
