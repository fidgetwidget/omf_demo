var through = require('through2');
var path = require('path');
var File = require('vinyl');

// Write the stream of files filenames as a json file key: value 
// (key being the stem, and value beign the baseName)
module.exports = function(file, opt) {

  var outputFileName,
      output = {},
      mostRecentFile,
      mTime;

  if (typeof file === 'string') {
    outputFileName = file;
  } else if (typeof file.path === 'string') {
    outputFileName = path.basename(file.path);
  } else {
    throw new Error('gulp-jsonFileList: Missing path in file options');
  }


  function bufferContents(file, enc, cb) {
    console.log(file.path);
    // set latest file if not already set,
    // or if the current file was modified more recently.
    if (!mTime || file.stat && file.stat.mtime > mTime) {
      mostRecentFile = file;
      mTime = file.stat && file.stat.mtime;
    }

    if (!file.stem)
      file = new File({ path: file.path });

    // if this is the first file
    if (!output.files) 
      output.files = [];

    // set the value for this file
    output.files.push({ "name": file.stem, "url": "images/"+file.basename });

    cb();
  }


  function endStream(cb) {
    // no files passed in, no file goes out
    if (!mostRecentFile || !output) {
      cb();
      return;
    }

    var ouputFile;
    outputFile = new File({path: outputFileName});
    outputFile.contents = new Buffer(JSON.stringify(output));

    this.push(outputFile);
    cb();
  }

  return through.obj(bufferContents, endStream);

};
