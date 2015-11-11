// alert("hello");

document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);

function fireContentLoadedEvent () {
    if($(".captiontext").text()==="Sections Found"){
      $(".datadisplaytable tr td:nth-child(17)").each(function (i,elem) {
        chrome.runtime.sendMessage({
            method: 'GET',
            action: 'xhttp',
            url: 'http://localhost:5000/get_prof_rating/'+$(elem).context.innerText,
            data: ''
        }, function(responseText) {
            $(elem).html("<span style='color:red;'>("+responseText+")</span> "+$(elem).context.innerText);
        });
      });
    }
}
