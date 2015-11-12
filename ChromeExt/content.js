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
        var name = clean_name(prof);
        search_for_prof(name, elem);
      });
    }
}

//attempts to search RMP for the prof and get their ID
function search_for_prof(name, elem){
  chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: 'http://search.mtvnservices.com/typeahead/suggest/?prefix='+name+'&fq=schoolid_s%3A563&siteName=rmp',
        data: ''
    }, function(responseText) {
        obj = JSON.parse(responseText);
        //if no results were found, show ? in place of rating
        if(obj['response']['numFound'] < 1){
          add_rating_to_prof(" ? ", elem)
        }
        //if results were found, take best match (first item)
        var id = obj['response']['docs'][0]['pk_id'];
        get_rating(id, elem);
    });
}

function get_rating(id, elem){
  chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url:   'http://www.ratemyprofessors.com/ShowRatings.jsp?tid='+id,
        data: ''
    }, function(responseText) {
        html = $.parseHTML(responseText);
        var rating = $(html).find(  ":contains('Overall Quality') .breakdown-header .grade")[0].innerText;
        add_rating_to_prof(rating, elem)
    });
}

function add_rating_to_prof(rating, elem){
    var color = "red";
    if (rating != " ? "){
      if (rating >= 4.0){
        color = "#33cc33";
      }else if(rating >= 3.0){
        color = "#00ccff";
      }else if(rating >= 2.0){
        color = "#fe7f00";
      }
    } 
    $(elem).html("(<span style='color:"+color+";'>"+rating+"</span>) "+  $(elem).html());
}

//cleans the name displayed on marist course lookup in prep for search
// "Matthew P. Johnson (P)" --> "Matthew Johnson"
function clean_name(name){
  //split up words in name so we can evaluate each one
  var exploded_name = name.split(" ");
  //this will contain only the words we deem valid (no special chars, no initials)
  var exploded_clean_name = [];
  //iterate through each word in name
  exploded_name.forEach(function(word) {
    if(word.length < 2){//initial if only 1 letter
      return;//reject word
    }
    if(word.indexOf("(") > -1){// filtering out "(P)"
      return;//reject word
    }
    //this word has passed all tests, so add it to the cleaned name
    exploded_clean_name.push(word);
  });
  //we only want first and last name
  var clean_name = exploded_clean_name[0]+" "+exploded_clean_name[exploded_clean_name.length-1];
  return clean_name;
}
