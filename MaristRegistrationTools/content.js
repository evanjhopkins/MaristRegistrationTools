document.addEventListener('DOMContentLoaded', main, false);

searched = [];//tracks profs we've already searched to stop redundant lookups
function main() {
    var prof, rating;

    //if we are on the correct rendering of the page(i.e. the one that shows actual classes)
    if($(".captiontext").text()==="Sections Found"){
      //loop through each row
      $(".datadisplaytable tr td:nth-child(17)").each(function (i,elem) {
        //add placeholder text to row, this will be replaced with actual value
        $(elem).html("(<span class='rating'>_._</span>) "+  $(elem).html());

        //get professor name
        prof = $(elem).context.innerText;
        //if we dont have this professors rating yet...
        if ($.inArray(prof, searched) == -1){
          searched.push(prof);//record that we have searched for this professor so no redundant searched are made
          var name = clean_name(prof);//convert name to just first and last name
          search_for_prof(name, elem);//execute search -> get_rating -> add_rating_to_prof
          //Note: these methods execute in a chain rather than sequential calls on purpose.
        }
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
        }else{
          //if results were found, take best match (first item)
          var id = obj['response']['docs'][0]['pk_id'];
          get_rating(id, elem);
        }
    });
}

//given a RMP id, get their overall rating
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
    //set color depending on rating range (red=bad, green=good, etc..)
    var color = color_code_rating(rating);

    //get the name of the professor we have the rating for
    prof = $(elem).context.innerText;
    //loop through every professor on the page
    $(".datadisplaytable tr td:nth-child(17)").each(function (i,elem2) {
      //get the name of the professor of this iteration of the loop
      prof2 = $(elem2).context.innerText;
      //if this professor matches the one we have a rating for
      if (prof == prof2){
        $(elem2).find(".rating").css("color", color);//set color
        $(elem2).find(".rating").html(rating);//add rating
      }
    });
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

//return a color code for a given rating
function color_code_rating(rating){
  var color;
  if (rating != " ? "){
    if (rating >= 4.0){
      color = "#33cc33";
    }else if(rating >= 3.0){
      color = "#00ccff";
    }else if(rating >= 2.0){
      color = "#fe7f00";
    }else{
      color = "red";
    }
  } 
  return color;
}
