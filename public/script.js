function submitForm() {
  postData($('#url_input').val(), processData)
  return false;
}

function processData(data) {
  var url = 'https://s-projects18-fcc-53.glitch.me/api/shorturl/'+data.short_url;
  if(data.short_url==undefined) url = "undefined";
  $('#shorturl').html(url);
  $('#shorturl').attr('href', url);
}

function postData(url, next) {
     $.ajax({
        url: 'https://s-projects18-fcc-53.glitch.me/api/shorturl/new',
        method: "POST",
       data: {url:url},
        statusCode: {404: function() {$('#result1').append("\rPage not found");}
      }
   })
   .done(function(data){next(data)})
   .fail(function(jqXHR, textStatus){
      alert('error: ' + textStatus);
   });
}