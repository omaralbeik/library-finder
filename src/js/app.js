
// AppViewModel
var AppViewModel = function() {
  // global this
  var self = this;

  // all current libraries will be stored in the libraries array
  self.libraries = ko.observableArray();

  self.currentLocation = ko.observable();

  // suggested bounds for the latest search, from foursquare
  self.currentSuggestedBounds = ko.observable();

  self.latestLatLngBounds = ko.observable();

  // current active tab in navbar // initially all
  self.currentTab = ko.observable('all');

  // inSearch boolean changes to true when there is an active request,
  // and when the request ends or fails, inSearch becomes false again
  self.inSearch = ko.observable(false);

  self.searchAll = function() {
    self.currentTab('all');
    self.searchLibraries();
  };

  self.searchOpen = function() {
    self.currentTab('open');
    self.searchLibraries();
  };

  self.searchTop = function() {
    self.currentTab('top');
    self.searchLibraries();
  };

  setCurrentLocation(function(pos) { // get location
    var crd = pos.coords;

    self.currentLocation({
      lat: crd.latitude,
      lng: crd.longitude
    });

    setMap(self.currentLocation(), function() {
      // map is ready
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (isPlaceValid(place)) {
          var loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          self.currentLocation(loc);
          self.searchLibraries();

        } else {
          console.log('should handle error');
        }
      });
      self.searchLibraries();
    });

  }, function(err) { // handle error
    console.warn('ERROR(' + err.code + '): ' + err.message);

    // initial location for map to Bahçeşehir University, Istanbul
    self.currentLocation({
      lat: 41.0417,
      lng: 29.0094
    });

    setMap(self.currentLocation(), function() {
      // map is ready

      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (isPlaceValid(place)) {
          var loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          self.currentLocation(loc);
          self.searchLibraries();

        } else {
          console.log('should handle error');
        }
      });

      self.searchLibraries();
    });
  });

  self.searchLibraries = function() {

    self.inSearch(true); // search started

    $.each(self.libraries(), function(index, library) {
      library().mapMarker().setMap(null);
    });

    self.libraries.removeAll(); // empty libraries array

    searchForLibrariesNearLocation(self.currentLocation(), self.currentTab(), function(data) {

      var items = data.response.groups[0].items;
      if (items.length < 1) {
        self.inSearch(false);
        if (self.currentTab() === 'open') {
          alert("No open libraries now!, please try again later.");
        } else {
          alert("No Libraries found!");
        }
        return;
      }


      // get suggested bounds from foursquare
      var suggestedBounds = data.response.suggestedBounds;
      self.currentSuggestedBounds(suggestedBounds);

      resizeMapToBounds(self.currentSuggestedBounds(), function() {
        // map is ready

        var totalDelay = items.length * 50;

        $.each(items, function(index, item) {
          var library = createLibraryFromItem(item);
          var delay = index * 50;

          setTimeout(function() {
            if (self.currentTab() === 'top') {
              creatMarker(library(), self.currentTab(), index + 1);
            } else {
              creatMarker(library(), self.currentTab(), null);
            }

            self.libraries.push(library);
          }, delay);
        });

        setTimeout(function() {
          self.inSearch(false); // search ended
        }, totalDelay);

      });

    }, function(error) {
      console.warn('Foursquare: ' + error.statusText);
      alert('Foursquare error: ' + error.statusText);
    });
  };

  self.showLibrary = function(library) {

    // if in mobile view, close list view
    if ($(window).width() < 768) {
      toggleTable();
    }

    animateAllMarkers(null); // stop all markers animation
    infowindow.close(); // close any open infowindow
    library.mapMarker().setAnimation(google.maps.Animation.BOUNCE); // bounce selected marker

    infowindow = createInfowindowForLibrary(library);

    // add close button event handler
    google.maps.event.addListener(infowindow, "closeclick", function() {
      animateAllMarkers(null); // stop animation for all markers

      // if in mobile view, zoom map back to old bounds
      if ($(window).width() < 768) {
        resizeMapToBounds(self.currentSuggestedBounds(), function() {});
      }
    });

    var latLng = library.mapMarker().getPosition(); // returns LatLng object
    map.setCenter(latLng); // setCenter takes a LatLng object

    // open info window when marker is clicked
    google.maps.event.addListenerOnce(map, 'idle', function() { // wait for map to load
      infowindow.open(map, library.mapMarker());
    });
  };
};


var appVM = new AppViewModel();

// Activates knockout.js
ko.applyBindings(appVM);
