/* srt2vtt.js
* Author        : faizath (https://github.com/faizath)
* License (MIT) : https://github.com/faizath/srt2vtt.js/blob/main/LICENSE
* Source        : https://github.com/faizath/srt2vtt.js
*/
window.srt2vtt = (function(){
  "use strict";
  var URL = window.URL || window.webkitURL;
  var functions = {};
  functions.convert = function(data) {
    // convert srt string to webvtt string, srt2vtt.convert(srt string)
    return srt2webvtt(data);
  };
  functions.url = function(data) {
    // return URL of webvtt file, srt2vtt.url(srt string)
    return URL.createObjectURL(new File([new Blob([srt2webvtt(data)], {encoding:'UTF-8',type:'text/plain'})], 'caption.vtt'));
  };
  functions.run = function() {
    // automatically replace srt <track> with webvtt, srt2vtt.run()
    var videos = document.querySelectorAll("video");
    for (var video = 0; video < videos.length; video++) {
      let tracks = videos[video].children;
      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].nodeName.toLowerCase() === "track") {
          getData(tracks[i].src, video, i);
        }
      }
    }
    function getData(url, video, i) {
      var req = new XMLHttpRequest();
      req.addEventListener("load", function(e){
        if(this.status == "200"){
          if (srtORvtt(this.response) === "srt") {
            videos[video].children[i].src = functions.url(this.response);
          }
        }
      }, false);
      req.open("GET", url, true);
      req.send();
    }
    function srtORvtt(data) {
      if (data.split("\n")[0].toLowerCase() === "webvtt") {
        return "vtt";
      } else {
        return "srt";
      }
    }
  };
  // License: https://github.com/silviapfeiffer/silviapfeiffer.github.io/blob/master/LICENSE
  function srt2webvtt(data) {
      // remove dos newlines
      var srt = data.replace(/\r+/g, '');
      // trim white space start and end
      srt = srt.replace(/^\s+|\s+$/g, '');
      // get cues
      var cuelist = srt.split('\n\n');
      var result = "";
      if (cuelist.length > 0) {
          result += "WEBVTT\n\n";
          for (var i = 0; i < cuelist.length; i = i + 1) {
              result += convertSrtCue(cuelist[i]);
          }
      }
      return result;
  }
  function convertSrtCue(caption) {
      // remove all html tags for security reasons
      //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
      var cue = "";
      var s = caption.split(/\n/);
      // concatenate muilt-line string separated in array into one
      while (s.length > 3) {
          for (var i = 3; i < s.length; i++) {
              s[2] += "\n" + s[i];
          }
          s.splice(3, s.length - 3);
      }
      var line = 0;
      // detect identifier
      if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
          cue += s[0].match(/\w+/) + "\n";
          line += 1;
      }
      // get time strings
      if (s[line].match(/\d+:\d+:\d+/)) {
          // convert time string
          var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
          if (m) {
              cue += m[1] + ":" + m[2] + ":" + m[3] + "." + m[4] + " --> " +
                  m[5] + ":" + m[6] + ":" + m[7] + "." + m[8] + "\n";
              line += 1;
          } else {
              // Unrecognized timestring
              return "";
          }
      } else {
          // file format error or comment lines
          return "";
      }
      // get cue text
      if (s[line]) {
          cue += s[line] + "\n\n";
      }
      return cue;
  }
  return functions;
}).call(this);
