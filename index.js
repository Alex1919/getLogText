var fs = require('fs');
var async = require('async');
var path = require('path');
var config = require('./configurations.js');

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};
var getData = function(files){
	files.forEach(function(element, index, files){
		fs.readFile(element, "utf-8", function(err, data){
			var res_line="";
			if(err) 
			  console.log('readFile: '+err);
			var lines = data.split("\n");
			for(var i = 0; i<lines.length; i++){
			  if(lines[i].indexOf(config.parameters.search_string)>-1){
				res_line = res_line+lines[i].substring(13, lines[i].length)+",";
			  }
			}
			fs.appendFile(config.parameters.res_file, res_line.substring(0, res_line.length-2)+"\n", "utf-8", function(err){
			  if(err) 
				console.log('appendFile: '+err);
			});
		});
	});	
};

walk(path.resolve(config.parameters.search_folder), function(err, files){
	if(fs.existsSync(path.join(__dirname, config.parameters.res_file))){
		fs.unlinkSync(config.parameters.res_file);
		
	}
	fs.closeSync(fs.openSync(config.parameters.res_file, 'w'));
	if(files.length>2000)
	{
		var size = 1000,
			k=0,
			chunk = [];

		for (var i=0,j=files.length; i<j; i+=size) {
			chunk.push(files.slice(i,i+size));	
		};
		async.whilst(
			function(){return k < chunk.length;},
			function(callback){
				getData(chunk[k]);
				k++;
				setTimeout(callback, 1000);
			},
			function(err){}
			);

	}
	else
	{
		getData(files);
	}
  }); 