// alert("hello");

document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
var mem_cache = {};
var cnt = 0;
var professors = [];

function fireContentLoadedEvent () {
    var prof, rating;
    if($(".captiontext").text()==="Sections Found"){
      $(".datadisplaytable tr td:nth-child(17)").each(function (i,elem) {
        prof = $(elem).context.innerText;
        professors.push(elem);
      });
      lookup();
    }
}

function lookup(){
  if (cnt > professors.length-1){
    return;
  }

  var elem = professors[cnt];
  cnt++;
  var prof = $(elem).context.innerText;
  if (prof in mem_cache){
    console.log("mem");
    rating = mem_cache[prof];
    $(elem).html("<span style='color:red;'>("+rating+")</span> "+$(elem).context.innerText);
    lookup();
  }else{
    console.log("lookup");
    chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: 'http://evanjhopkins.com/MaristCourseLookupProfessorRating/API/ratemyprof.php?prof='+prof,
        data: ''
    }, function(responseText) {
        rating = responseText;
        mem_cache[$(elem).context.innerText] = rating;
        $(elem).html("<span style='color:red;'>("+rating+")</span> "+$(elem).context.innerText);
        lookup();
    });
  }
}
