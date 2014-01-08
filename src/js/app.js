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


// contacts

function loadContacts() {
  $("#contacts").empty();

  var i = 0;
  for (i = 0; i < asyncStorage.length; i++) {
    var id = "contact-" + i;
    var email = asyncStorage.getItem(id);
    var contact = "<li id='" + id + "'>" + email + "</li>";
    $("#contacts").append(contact);
  }
}


function addContact(email) {
  console.log("adding contact " + email);
  var i = 0;
  for (i = 0; i < asyncStorage.length; i++) {
    var id = "contact-" + i;
    var currentEmail = asyncStorage.getItem(id);
    if (currentEmail==email) {
        return;
    }
  }
  var nextId = asyncStorage.length;
  var id = "contact-" + nextId;
  asyncStorage.setItem(id, email);
  loadContacts();
}

function removeContact(email) {
  var i = 0;
  for (i = 0; i < asyncStorage.length; i++) {
    var id = "contact-" + i;
    var currentEmail = asyncStorage.getItem(id);
    if (currentEmail==email) {
        asyncStorage.removeItem(id);
        loadContacts();
        return;
    }
  }
}

function notifyContact(email, message) {

}


var contactLink = document.getElementById('addContact');
if (contactLink) {
  contactLink.onclick = function() {
    alert("adding contact");
    addContact($('#newContact').val();
  };
}



