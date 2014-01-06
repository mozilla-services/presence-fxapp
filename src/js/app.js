// persona login
// XXX will be replaced by a Firefox Account token at some point
var signinLink = document.getElementById('signin');
if (signinLink) {
  signinLink.onclick = function() { navigator.id.request(); };
}

var signoutLink = document.getElementById('signout');
if (signoutLink) {
  signoutLink.onclick = function() { navigator.id.logout(); };
}

var currentUser = null;

navigator.id.watch({
  loggedInUser: currentUser,
  onlogin: function(assertion) {
    $.ajax({
      type: 'POST',
      url: 'http://presence.ziade.org/login',
      dataType: 'json',
      data: {assertion: assertion},
      success: function(res, status, xhr) {
        currentUser = res.email;
        $('#user').text(res.email);
        $('#signin').hide();
        $('#signout').show();
      },
      error: function(xhr, status, err) {
        navigator.id.logout();
        $('#user').text("anonymous");
        $('#signout').hide();
        $('#signin').show();
      }
    });
  },
  onlogout: function() {
    $.ajax({
      type: 'POST',
      url: 'http://presence.ziade.org/logout', 
      success: function(res, status, xhr) { 
        currentUser = null;
        $('#user').text("anonymous");
      },
      error: function(xhr, status, err) { alert("Logout failure: " + err); }
    });
  }
});


