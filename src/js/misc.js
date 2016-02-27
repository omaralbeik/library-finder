var info_name = '<h4 class="info_name">%verified_icon% %name% %verified%</h4>';
var info_address = '<p class"info-p"> <i class="fa fa-map-marker"></i>  %address%</p>';
var info_status = '<p class"info-p"><i class="fa fa-clock-o"></i>  %status%</p>';
var info_rating = '<p info-p><i class="fa fa-star"></i> Rated: <strong style="color:%color%;">%rating% / 10</strong> by %users% visitors</p>';

var info_contact = '<ul class="info_contact"><li> Contact: <li></ul>';
var info_contact_container = '<div></div>';

var info_url = '<li><a href="%url%" target="_blank"><i class="fa fa-external-link fa-2x"></i></a></li>';
var info_phone = '<li><a href="tel:%phone%"><i class="fa fa-phone fa-2x"></i></a></li>';
var info_facebook = '<li><a href="https://www.facebook.com/%id%" target="_blank"><i class="fa fa-facebook fa-2x"></i></a></li>';
var info_twitter = '<li><a href="https://twitter.com/%name%" target="_blank"><i class="fa fa-twitter fa-2x"></i></a></li>';
var info_foursquare = '<li><a href="https://foursquare.com/v/%id%" target="_blank"><i class="fa fa-foursquare fa-2x"></i></a></li>';


// extention to jQuery by Tomasz Majerski
// http://stackoverflow.com/questions/2155453/jquery-toggle-text
$.fn.extend({
  toggleText: function(a, b) {
    if (this.html() == a) {
      this.html(b);
    } else {
      this.html(a);
    }
  }
});

// returns true if string contains given word
var wordInString = function(s, word) {
  return new RegExp(word, 'i').test(s); // regular expression
};

// hide navbar if map clicked, when in mobile view
$('#map').click(function(event) {
  var clickover = $(event.target);
  var $navbar = $(".navbar-collapse");
  var _opened = $navbar.hasClass("in");
  if (_opened === true && !clickover.hasClass("navbar-toggle")) {
    $navbar.collapse('hide');
  }
});

// helper method to hide navbar in mobile view
var hideNavBar = function() {
  if ($('.navbar-collapse').hasClass("in")) {
    $('.navbar-toggle').click();
  }
};

var toggleTable = function() {
  $('.table-container').toggle('drop');
  $('#table-button').toggleText('<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span> Hide List',
    '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span> Show List');
};

// add clear button to input
$('input').addClear();

// hide table container initially
$('.table-container').hide();
$('.table-container').removeClass('hidden');
