var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cors = require('cors');
var Q = require('q');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(cors());

var testVal = ['http://creativecommons.', 'http://www.cs.uwaterloo.ca/','http://www.biomedcentral.com/1472-6947/9/24','http://www.biomedcentral.com/info/publishing_adv.asp'];

app.get('/', function (req, res) {
  //res.send('Hello World!');
  var promiseArray = [];
  for(var i =0; i < testVal.length; i++){
    promiseArray.push(GetRequestNoRedirects(testVal[i]));
  }
  Q.all(promiseArray).then(
    function (statusArray) {
      var retVal = [];
      for(var j =0; j < testVal.length; j++){
        retVal.push({url:testVal[j],status:statusArray[j]});
      }
      res.send(retVal);
    },
    function(error){
      res.status(500).send('Unexpected Error.');
    }
  );
});

app.post('/', function (req, res) {
  //console.log(req.body);//debug
  if(req.body.url)
  {
    if(req.body.url.length < 1)
      res.status(400).send('Malformed post body');
      
    var promiseArray = [];
    for(var i =0; i < req.body.url.length; i++){
      promiseArray.push(GetRequestNoRedirects(req.body.url[i]));
    }
    
    //console.log('Testing status.');//debug
    Q.all(promiseArray).then(
      function (statusArray) {
        //console.log('Status Array ',statusArray);//debug
        var retVal = [];
        for(var j =0; j < req.body.url.length; j++){
          retVal.push({url:req.body.url[j],status:statusArray[j]});
        }
        res.send(retVal);
      },
      function(error){
        res.status(500).send('Unexpected Error.');
      }
    );
   }else
    res.status(400).send('Malformed post body');
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('scanner app listening at http://%s:%s', host, port);
});

var GetRequestNoRedirects = function(url){
  var deferred = Q.defer();
	superagent
		.get(url)
		.redirects(0)
		.end(function(err, res){
			if(err)
				deferred.resolve(err.status)
			else
				deferred.resolve(res.status);
		});
    return deferred.promise;
}
