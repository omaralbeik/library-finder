// Model
var Model = {
  markers: []
};

// AppViewModel
function AppViewModel() {

  // global variables
  var self = this;

  var map, autocomplete;
  self.markers = Model.markers;
  self.total = ko.observable(0);

  var bounds = new google.maps.LatLngBounds();

  /********************* Google Maps *********************/

  // Create a map object and specify the DOM element for display.
  self.initMap = function() {

    // initail location for map
    var initLocation = {
      lat: 41.0417,
      lng: 29.0094
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: initLocation,
      disableDefaultUI: false,
      scrollwheel: true,
      zoom: 12
    });
  }(); // () used to run the function as sson as script is called

  // clearMarkers function is used to delete all markers on map
  self.clearMarkers = function() {

    for (var i = 0; i < self.markers.length; i++) {
      self.markers[i].setMap(null);
    }
    self.markers = [];
  };

  // addMarkerWithDelay function is used to to create a merker with delay
  self.addMarkerWithDelay = function(venue, delay) {
    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        title: venue.name,
        animation: google.maps.Animation.DROP,
        position: {
          lat: venue.location.lat,
          lng: venue.location.lng
        }
      });
      marker.addListener('click', function() {
        // infowindow.open(map, marker);
        console.log(venue);
      });
      self.markers.push(marker);
      self.total(self.total() +1);

    }, delay);
  };

  /********************* Google Places *********************/

  // initialize autocompletion text input
  self.initSearch = function() {

    var input = document.getElementById('pac_input');
    var searchBox = new google.maps.places.SearchBox(input);

    var options = {
      // complete anly city names
      // types: ['(cities)']
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', function() {

      self.clearMarkers();
      self.total(0);

      // hide navbar
      if ($(window).width() < 768) {
        $('.navbar-toggle').click();
      }

      // get clicked place info from the autocomplete input
      var place = autocomplete.getPlace();
      console.log(place.name);

      // make sure that place has geometry infromation
      if (place.geometry) {

        // use foursquare API to check for libraries
        self.searchVenues(place.name, function(data) {

          console.log(data);

          // resize map to fit all results
          /************************************/

          // create a new empty bounds
          var bounds = new google.maps.LatLngBounds();

          // get suggested bounds from foursquare
          var suggestedBounds = data.response.suggestedBounds;

          // get north east bounds from suggestedBounds
          var ne = suggestedBounds.ne;

          // get south west bounds from suggestedBounds
          var sw = suggestedBounds.sw;

          // extend bounds to fit ne and sw
          bounds.extend(new google.maps.LatLng(ne.lat, ne.lng));
          bounds.extend(new google.maps.LatLng(sw.lat, sw.lng));

          // fit map to suggestedBounds
          map.fitBounds(bounds);
          /************************************/

          // get items from parsed data
          var items = data.response.groups[0].items;

          // add marker for each item
          $.each(items, function(index, item) {
            var venue = item.venue;
            self.addMarkerWithDelay(venue, index * 50);
            // self.total(self.total() +1);
          });
        });
      }

    });
  }(); // () used to run the function as sson as script is called

  /********************* Foursquare *********************/

  self.searchVenues = function(city, callback) {
    // list of allowed categories, for more info:
    // https://developer.foursquare.com/categorytree
    var categories = {
      library: '4bf58dd8d48988d12f941735',
      collegeLibrary: '4bf58dd8d48988d1a7941735'
    };

    var clientId = '05KBIJ3CKDQQUEQF14CJGLDP3D3P0X1ZIDL0AG5XHMKIX5AY';
    var clientSecret = 'GO4A1C0E1SI1RVFG20BT03D2YPITDSCTDMNPRDGYMAYLYJ4Y';
    var baseURL = 'https://api.foursquare.com/v2/';
    var method = 'venues/explore';

    $.ajax({
      url: baseURL + method,
      type: 'GET',
      dataType: 'json',
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        v: '20160230',
        // section: 'arts',
        query: 'library',
        near: city,
        limit: '100',
        categoryId: [categories.collegeLibrary]
      },
      success: callback
    });
  };
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());


function hideNavBar() {
  if ($(window).width() < 768) {
    $('.navbar-toggle').click();
  }
}

// hide navbar after a link is clicked
$('.nav a').on('click', function() {
  // check if device is mobile first
  hideNavBar();
});
