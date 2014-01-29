var appId = 'someid';
var isFFOS = (!!"mozApps" in navigator && navigator.userAgent.search("Mobile") != -1);

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


// XXX move to wss:// and https://
var currentUser = null;
var presenceServerURL = 'http://54.184.23.239:8282/'
var presenceSocketURL = 'ws://54.184.23.239:8282/presence'
var tribeServerURL = 'http://54.184.23.239:8282/';
var tribeSocketURL = 'ws://54.184.23.239:8080/tribe';


navigator.id.watch({
  loggedInUser: currentUser,
  onlogin: function(assertion) {

    // calling the Presence Server
    $.ajax({
      type: 'POST',
      url: presenceServerURL + 'login',
      dataType: 'json',
      data: {assertion: assertion},
      success: function(res, status, xhr) {
        currentUser = res.email;
        $('#user').text(res.email);
        $('#signin').hide();
        $('#signout').show();
        startPresenceWS();
        startTribeWS();
        loadApps();
      },
      error: function(xhr, status, err) {
        navigator.id.logout();
        $('#user').text("anonymous, please connect");
        $('#signout').hide();
        $('#signin').show();
        stopPresenceWS();
        stopTribeWS();
        hideApps();
      }
    });

  },
  onlogout: function() {
    $('#user').text("anonymous");
    currentUser = null;
    stopWS();
    stopTribeWS();
  }
});



/**
*
*  MD5 (Message-Digest Algorithm)
*  http://www.webtoolkit.info/
*
**/
var md5 = function (string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };
    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
    string = Utf8Encode(string);
    x = ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    return temp.toLowerCase();
}

// contacts
if (isFFOS) {
  var storage = asyncStorage;
}
else {
  var storage = localStorage;
}


function emailToId(mail) {
  var email_id = mail.replace('@', '_');
  return email_id.replace('.', '_');
}

function openSendDialog(mail) {
  $("#targetMail").val(mail);
  $("#dialog-form").dialog('option', 'title', "Send to " + mail);
  $("#dialog-form").dialog("open");
  return false;
}


function loadContacts() {
  $("#contacts").empty();

  for (var email in storage) {
    var email_id = emailToId(email);
    var gravatar = md5(email);
    var linkUrl = 'http://www.gravatar.com/avatar/' + gravatar;
    var link = '<img class="contactAvatar" onclick="openSendDialog(\'';
    link += email + '\')" src="' + linkUrl + '"/>';

    var status = '<span id="status-' + email_id + '">?</span>';
    var contact = "<li id='" + email_id + "'>";
    contact += "<img src='media/delete.png' onclick='deleteContact(\""  +email + "\")' class='delete'/>"
    email = "<div class='contactEmail' onclick='openSendDialog(\"" + email + "\")'>" +email+"</div>";
    contact += status + link + email + "</li>";
    $("#contacts").append(contact);
  }
}

function deleteContact(email) {
  if (storage.getItem(email)) {
    storage.removeItem(email);
    loadContacts();
  }
}


function addContact(email) {
  if (storage.getItem(email)) {
    // already exists
    return;
  }
  // XXX we will store more info later
  storage.setItem(email, {});
  loadContacts();
  return false;
}

function removeContact(email) {
  var i = 0;
  for (i = 0; i < storage.length; i++) {
    var id = "contact-" + i;
    var currentEmail = storage.getItem(id);
    if (currentEmail==email) {
        storage.removeItem(id);
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
    var email = $('#newContact').val();
    addContact(email);
    return false;
  };
}


// websocket for server interaction

// receiving a status update from the server
var tribe_ws = null;

function stopTribeWS() {
  if (tribe_ws) {
    tribe_ws.close();
    tribe_ws = null;
  }
}


function startTribeWS() {
  stopTribeWS();

  tribe_ws = new WebSocket(tribeSocketURL);

  tribe_ws.onopen = function() {
    console.log('websocket opened');
  }

  tribe_ws.onmessage = function(evt) {

    var data = jQuery.parseJSON(evt.data);
    var email_id = emailToId(data.uid);

    $('#status-' + email_id).text(data.status);
    var msg = data.uid + " is now " + data.status;
    status_notified(msg);
  };
}


function sendMessage(mail, message) {
  if (!tribe_ws) {
    alert("No connection");
    return;
  }

  if (!currentUser) {
    alert("You need to be connected");
    return;
  }

  // XXX crypto ...
  tribe_ws.send(JSON.stringify({'user': currentUser,
                          'action': 'notification',
                          'target': mail,
                          'message': message,
                          'source': appId}));
  console.log("Message sent...");
}

// sending a notification to another user
function notify(user) {
  var current = currentUser;

  tribe_ws.send(JSON.stringify({'user': current,
                          'action': 'notification',
                          'target': user,
                          'message': current + ' says hi!'
  }));
}



function grantPresence() {
  var href = presenceServerURL + 'grant/' + appId;
  window.location.replace(href + '?redirect=' + location.href);
}

function revokePresence() {
  var href = presenceServerURL + 'revoke/' + appId;
  href += '?redirect=' + location.href + '?revoked=1';
  window.location.assign(href);
}


$( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 175,
    width: 300,
    modal: true,
    buttons: {
        "Send": function() {
           var mail = $("#targetMail" ).val(), msg = $("#msg").val();
           sendMessage(mail, msg);
           $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
    },
    close: function() {}
});


// presence web socket
var presence_ws = null;


function startPresenceWS() {
  stopPresenceWS();
  console.log('Creating web socket on ' + presenceSocketURL);
  presence_ws = new WebSocket(presenceSocketURL);

  presence_ws.onopen = function() {
    console.log('setting ourselves online');
    presence_ws.send(JSON.stringify({'status': 'online', 'user': currentUser}));
    console.log('sent');

  }

  presence_ws.onmessage = function(evt) {
    var data = jQuery.parseJSON(evt.data);
    console.log(data);

    if (data.status=='notification') {
      $.each(data.notifications, function(key, notification) {
         console.log(notification);
         if (!notification.source || notification.source == 'root') {
           status_notified(notification.message);
         }
         else {
           $('#messageSource').val(notification.source);
           var msg = notification.source + ' says "' + notification.message + '".';
           notified(msg);
         }
      });
      return;
    }
    $('#status').text(data.status);
  };

  $('#online').click(function(){
    var msg = JSON.stringify({'status': 'online', 'user': currentUser});
    console.log('sending ' + msg);
    presence_ws.send(msg);
    console.log('sent');

  });

  $('#offline').click(function(){
    var msg = JSON.stringify({'status': 'offline', 'user': currentUser});
    console.log('sending ' + msg);
    presence_ws.send(msg);
    console.log('sent');
  });

  console.log('showing status bar');
  $('#statusbar').show();

}

function stopPresenceWS() {
  if (presence_ws) {
    presence_ws.close();
    presence_ws = null;
  }
  $('#statusbar').hide();
}

// XXX default action for the prototype:
// toggle to the tribes tab and open the
// send message box
function respondMessage() {
    $("#message:visible" ).removeAttr( "style" ).fadeOut();
    $('#tabs').tabs('option', 'active', 1);
    openSendDialog($('#messageSource').val());
}



function closeMessage() {
    $("#message:visible" ).removeAttr( "style" ).fadeOut();
}

function notified(msg) {
    function callback() {
      setTimeout(function() {
      $( "#message:visible" ).removeAttr( "style" ).fadeOut();
      }, 10000 );
    };
    var options = {};
    $('#message-body').text(msg);
    $('#respondButtons').show();
    $('#message').show("drop", options, 500, callback);
}

function status_notified(msg) {
    function callback() {
      setTimeout(function() {
      $( "#message:visible" ).removeAttr( "style" ).fadeOut();
      }, 2000);
    };
    var options = {};
    $('#message-body').text(msg);
    $('#respondButtons').hide();
    $('#message').show("drop", options, 500, callback);
}



