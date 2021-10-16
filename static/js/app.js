/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'static/js/particles.json', function() {
  console.log('callback - particles.js config loaded');
});



$(document).ready(function(){

  $(".form-register").hide();


  $(".login-register").click(function(){
    $(".form-signin").hide();
    $(".form-register").show();
  });

  $(".register-login").click(function(){
    $(".form-register").hide();
    $(".form-signin").show();
  });

  
  $("form").submit(function() {
    event.preventDefault();
    const data = new FormData(event.target);
    const value = Object.fromEntries(data.entries());
    console.log({ value });
    $(this).closest('form').find(".form-control").val("");
    
    if (value["type"] == "register"){
      alert("Attempting to create acount, this should take about 30 seconds.\nPlease press OK to continue.");
    }
    $.ajax({
      type: "POST",
      url: "/postlogin",
      contentType: "application/json",
      data: JSON.stringify(value),
      dataType: "json",
      success: function(response) {
        // var post_responce = response.responseText;
        console.log(response);
        alert(response.msg);
        if (response.redirect){
          window.location.href = response.redirect_url;
        }
      },
      error: function(err) {
        console.log(err);
        alert(err.responseText);
      }
    });
  });
});

