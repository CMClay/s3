
/**
 * Module dependencies.
 */

var conf = require('../config')
  , crypto = require('crypto')
  , express = require('express');

var app = express();

app.use(express.logger('dev'));

app.get('/sign', function(req, res){
  var obj = {
    bucket: conf.bucket,
    key: conf.key,
    secret: conf.secret,
    expires: 5 * 60 * 1000,
    mime: req.query.mime,
    name: req.query.name,
    query: req.query.query,
    acl: req.query.acl,
    method: req.query.method || 'PUT'
  };

  console.log(obj);
  res.send(sign(obj));
});

app.use(express.static(__dirname + '/../build'));
app.use(express.static(__dirname));

app.listen(4000);
console.log('listening on port 4000');

function sign(options) {
  var expires = (Date.now() + options.expires) / 1000 | 0;

  var str = options.method.toUpperCase()
    + '\n\n' + (options.mime || '')
    + '\n' + expires
    + (options.acl ? '\nx-amz-acl:' + options.acl : '')
    + '\n/' + options.bucket
    + '/' + options.name + (options.query || '');

  var sig = crypto
    .createHmac('sha1', options.secret)
    .update(str)
    .digest('base64');
  sig = encodeURIComponent(sig);

  return 'http://' + options.bucket
    + '.s3-us-west-1.amazonaws.com/'
    + options.name
    + '?Expires=' + expires
    + '&AWSAccessKeyId=' + options.key
    + '&Signature=' + sig
    + (options.query ? '&' + options.query.slice(1) : '');
}
