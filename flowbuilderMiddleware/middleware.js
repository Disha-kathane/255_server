var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var Lupin = require('./routes/lupin');
var TorrentNew = require('./routes/TorrentNew');
var Motabhai = require('./routes/motabhai');
var EducationExam = require('./routes/EducationExam');
var Png = require('./routes/png');
var Spicejet = require('./routes/spicejet');
var qaizenx = require('./routes/qaizenx');
var venulook = require('./routes/venulook');
var bharti = require('./routes/bhartisahakaribank');
var macro = require('./routes/micromax');
var Sterlin = require('./routes/sterlin');
var Parkemail = require('./routes/parkemail');
var DIPRMsg = require('./routes/DIPR');
var countrycode = require('./routes/countrycode');
var rajkotBank = require('./routes/rajkotBank');
var Torrent_png = require('./routes/torrent_png');
var karnatakaOne = require('./routes/karnatakaone');
var kdhospital = require('./routes/kdhospital');
var metroleads = require('./routes/metroleads');
var qrdemo = require('./routes/qrdemo');
var kavedia = require('./routes/kavedia');
var leadSquare = require('./routes/lead');
var cashOnDelivery = require('./routes/cashOnDelivery.js');
var shyamsteel = require('./routes/shyamsteel');
var goenka = require('./routes/rpg');
var catalogProduct = require('./routes/pincatalog');
var callbackmiddleware = require('./routes/callbackmid');
var extramrkcbkmiddleware = require('./routes/extramarkscbkmiddleware');
var extdaymiddleware = require('./routes/extdaymiddleware');
var yamaha = require('./routes/yamaha');
var pantaloon = require('./routes/pantaloon');
var killerjeans = require('./routes/killerjeans');
const ajarabank = require('./routes/ajara_bank');
var titan1Spoc = require('./routes/titan1Spoc');
var ceopunjab = require('./routes/cec_punjab.js');
var torrent_payment_controller = require('./routes/torrent_payment');
const Torrent_PNG = require('./routes/Torrent_PNG_1');

require('./cron/extramarks').start();
require('./cron/extramarksday1').start();
require('./cron/extdeletecron').start();

var pmc = require('./routes/pmc');
var billdesk = require('./routes/billdeskTest');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/lup', Lupin);
app.use('/tor', TorrentNew);
app.use('/bse', Motabhai);
app.use('/er', EducationExam);
app.use('/pn', Png);
app.use('/spicejet', Spicejet);
app.use('/qai', qaizenx);
app.use('/venu', venulook);
app.use('/bha', bharti);
app.use('/mac', macro);
app.use('/ster', Sterlin);
app.use('/pe', Parkemail);
app.use('/DIPR', DIPRMsg);
app.use('/ctr', countrycode);
app.use('/rajkotbank', rajkotBank);
app.use('/torrentP', Torrent_png);
app.use('/karnatakaOne', karnatakaOne);
app.use('/kd', kdhospital);
app.use('/pmc', pmc);
app.use('/metro', metroleads);
app.use('/qrdemo', qrdemo);
app.use('/kav', kavedia);
app.use('/lead', leadSquare);
app.use('/', cashOnDelivery);
app.use('/rpg', goenka);
app.use('/pincatalog', catalogProduct);
app.use('/shyamsteel', shyamsteel);
app.use('/billdesk', billdesk);
app.use('/callback', callbackmiddleware);
app.use('/cbk', extramrkcbkmiddleware);
app.use('/ext/days', extdaymiddleware);
app.use('/yamaha', yamaha);
app.use('/pantaloon', pantaloon);
app.use('/killerjeans', killerjeans);
app.use('/ajarabank', ajarabank);
app.use('/titan1Spoc', titan1Spoc);
app.use('/cecpunjab', ceopunjab);
app.use('/torrent_payment', torrent_payment_controller);
app.use('/torPNG', Torrent_PNG);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(5000, '0.0.0.0', function () {
  console.log('Api project is listening on port 5000!');
});

module.exports = app;
