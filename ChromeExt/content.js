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
        clean_name(prof);
      });
      //lookup();
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

//attempts to search RMP for the prof and get their ID
function search_for_prof(){

}

//cleans the nam displayed on marist course lookup in prep for search
// "Matthew P. Johnson (P)" --> "Matthew Johnson"
function clean_name(var name){
  //split up words in name so we can evaluate each one
  var exploded_name = name.split(" ");
  //this will contain only the words we deem valid (no special chars, no initials)
  var exploded_clean_name = [];
  //iterate through each word in name
  exploded_name.forEach(function(word) {
    console.log(word);
  });
}
