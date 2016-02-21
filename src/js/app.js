// Model
var Library = function() {
  var self = this;

  self.name = ko.observable();
  self.id = ko.observable();

  self.lat = ko.observable();
  self.lng = ko.observable();

  self.address = ko.observable();
  self.city = ko.observable();
  self.country = ko.observable();

  self.rating = ko.observable();
  self.url = ko.observable();
  self.images = ko.observableArray();

  self.mapMarker = ko.observable();

};

// AppViewModel
function AppViewModel() {

  // global variables
  var self = this;
  var map, autocomplete, bounds;
  self.libraries = ko.observableArray();

  self.currentLibrary = ko.observable(new Library());

  self.currentTab = ko.observable('recommended');
  self.inSearch = ko.observable(false);

  self.currentPlace = ko.observable();

  self.searchRecommended = function() {
    self.currentTab('recommended');
    console.log('currentTab changed to recommended');
    self.searchLibraries();
  };

  self.searchOpen = function() {
    self.currentTab('open');
    console.log('currentTab changed to open');
    self.searchLibraries();
  };

  self.searchTop = function() {
    self.currentTab('top');
    console.log('currentTab changed to top');
    self.searchLibraries();
  };


  /********************* Google Maps *********************/

  // Create a map object and specify the DOM element for display.
  self.initMap = function() {

    // initail location for map to Bahçeşehir University, Istanbul
    var initLocation = {
      lat: 41.0417,
      lng: 29.0094
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: initLocation,
      disableDefaultUI: true,
      scrollwheel: true,
      zoom: 12
    });
  }(); // () used to run the function as soon as script is called


  // clearMarkers function is used to delete all markers on map
  self.clearMarkers = function() {
    for (var i = 0; i < self.libraries().length; i++) {
      self.libraries()[i]().mapMarker().setMap(null);
    }
    self.libraries.removeAll();
  };

  // addMarkerWithDelay function is used to create a merker with delay
  self.addMarkerWithDelay = function(library, delay) {

    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        title: library().name().name,
        animation: google.maps.Animation.DROP,
        position: {
          lat: library().lat(),
          lng: library().lng()
        }
      });
      marker.addListener('click', function() {
        console.log(library().name());
      });
      library().mapMarker(marker);
    }, delay);
  };

  /********************* Google Places *********************/

  // initialize autocompletion text input
  self.initSearch = function() {

    var input = document.getElementById('input');
    var searchBox = new google.maps.places.SearchBox(input);

    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {

      self.clearMarkers();

      // get clicked place info from the autocomplete input
      self.currentPlace(autocomplete.getPlace());

      // console.log(place);

      // make sure that place has geometry infromation
      if (self.currentPlace().geometry) {
        // use foursquare API to check for libraries
        self.searchLibraries();
      }


      // if in mobile view; hide navbar after delay
      //so user notices filters
      window.setTimeout(function() {

        if ($(window).width() < 768) {
          $('.navbar-toggle').click();
        }
      }, 1500);
    });
  }(); // () used to run the function as soon as script is called


  /********************* Foursquare *********************/

  self.searchLibraries = function() {

    // first things first, delete any old markers
    self.clearMarkers();

    // set inSearch to true
    self.inSearch(true);

    console.log('searchLibraries | ' + self.currentTab());


    var categories = {
      // list of allowed categories, for more info:
      // https://developer.foursquare.com/categorytree
      library: '4bf58dd8d48988d12f941735',
      collegeLibrary: '4bf58dd8d48988d1a7941735'
    };

    var clientId = '05KBIJ3CKDQQUEQF14CJGLDP3D3P0X1ZIDL0AG5XHMKIX5AY';
    var clientSecret = 'GO4A1C0E1SI1RVFG20BT03D2YPITDSCTDMNPRDGYMAYLYJ4Y';
    var baseURL = 'https://api.foursquare.com/v2/';
    var method = 'venues/explore';

    var ajaxData = {
      client_id: clientId,
      client_secret: clientSecret,
      v: '20160230',
      query: 'library',
      ll: self.currentPlace().geometry.location.lat() + ',' + self.currentPlace().geometry.location.lng(),
      limit: '100',
      categoryId: [categories.collegeLibrary]
    };

    if (self.currentTab() === 'open') {
      ajaxData.openNow = true;
    } else if (self.currentTab() === 'top') {
      ajaxData.limit = 10;
    }

    $.ajax({
      url: baseURL + method,
      type: 'GET',
      dataType: 'json',
      data: ajaxData,
      success: function(data) {
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

        //     // get items from parsed data
        var items = data.response.groups[0].items;

        // create a Library item for each item, and push it to libraries array
        $.each(items, function(index, item) {
          var venue = item.venue;

          var library = ko.observable(new Library());
          library().name(venue.name);
          library().id(venue.id);
          library().lat(venue.location.lat);
          library().lng(venue.location.lng);
          library().address(venue.location.adress);
          library().city(venue.location.city);
          library().country(venue.location.country);
          library().rating(venue.rating);
          library().url(venue.url);

          self.addMarkerWithDelay(library, index * 50);

          setTimeout(function() {
            self.inSearch(false);
          }, items.length * 50);

          self.libraries.push(library);

        });

        console.log(self.libraries().length);

      }
    });

  };


  //   self.searchLibraries = function(data) {
  //
  //     console.log(data);
  //
  //     // get items from parsed data
  //     var items = data.response.groups[0].items;
  //
  //     // add marker for each item
  //
  //     $.each(items, function(index, item) {
  //       var venue = item.venue;
  //       self.addMarkerWithDelay(venue, index * 50);
  //     });
  //     self.inSearch(false);
  // };
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
