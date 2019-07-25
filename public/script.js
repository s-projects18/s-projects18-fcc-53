function submitForm() {
  var url = $('#url_input').val();
  if(url.indexOf('http')==-1) {
    alert("Missing Protocol in url: https:// or http://");
    return false;
  }
  postData(url, processData)
  return false;
}

function postData(url, next) {
     $.ajax({
        url: 'https://s-projects18-fcc-53.glitch.me/api/shorturl/new',
        method: "POST",
       data: {url:url},
        statusCode: {404: function() {alert("\rPage not found");}
      }
   })
   .done(function(data){next(data)})
   .fail(function(jqXHR, textStatus){
      alert('error: ' + textStatus);
   });
}

// next-function
function processData(data) {
  var url = 'https://s-projects18-fcc-53.glitch.me/api/shorturl/'+data.short_url;
  if(data.short_url==undefined) url = "Cannot evaluate URL";
  $('#shorturl').html(url);
  $('#shorturl').attr('href', url);
}