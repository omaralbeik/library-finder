
// AppViewModel
var AppViewModel = function() {
  // global this
  var self = this;

  // all current libraries will be stored in the libraries array
  self.libraries = ko.observableArray();

  // copied from libraries, will be filtred based on a search query
  self.filteredLibraries = ko.observableArray();

  // lastest location captured from google autocomplete
  self.currentLocation = ko.observable();

  // suggested bounds for the latest search, from foursquare
  self.currentSuggestedBounds = ko.observable();

  // current active tab in navbar // initially all
  self.currentTab = ko.observable('all');

  // inSearch boolean changes to true when there is an active request,
  // and when the request ends or fails, inSearch becomes false again
  self.inSearch = ko.observable(false);

  // search string from input in table view will be saved here
  self.query = ko.observable('');

  // search all libraries
  self.searchAll = function() {
    self.currentTab('all');
    self.searchLibraries();
  };

  // search open libraries
  self.searchOpen = function() {
    self.currentTab('open');
    self.searchLibraries();
  };

  // search top 10 libraries
  self.searchTop = function() {
    self.currentTab('top');
    self.searchLibraries();
  };

  // search for library by query, will be used in list view
  self.search = function(value) {
    self.filteredLibraries.removeAll(); // empty libraries array
    for (var i in self.libraries()) {
      if (self.libraries()[i]().name().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.filteredLibraries.push(self.libraries()[i]);
      }
    }
  };


  setCurrentLocation(function(pos) { // location successfully saved
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

          // update currentLocation
          self.currentLocation(loc);

          // search for libraries
          self.searchLibraries();

        } else { // handle error
          showNoPlaceFoundPopover();
        }
      });
      // search for libraries
      self.searchLibraries();
    });

  }, function(err) { // there was an error getting users location
    console.warn('ERROR(' + err.code + '): ' + err.message);

    // initial location for map set to Bahçeşehir University, Istanbul
    self.currentLocation({
      lat: 41.0417,
      lng: 29.0094
    });

    setMap(self.currentLocation(), function() {
      // map is ready

      // get place from autocomplete input
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (isPlaceValid(place)) { // check if place is valid
          var loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          // update currentLocation
          self.currentLocation(loc);

          // search for libraries
          self.searchLibraries();

        } else { // handle error
          showNoPlaceFoundPopover();
        }
      });
      // search for libraries
      self.searchLibraries();
    });
  });

  // this function is used search for libraries
  self.searchLibraries = function() {

    self.inSearch(true); // search started

    // remove any old markers
    $.each(self.libraries(), function(index, library) {
      library().mapMarker().setMap(null);
    });

    // remove old libraries
    self.libraries.removeAll();
    self.filteredLibraries.removeAll();

    searchForLibrariesNearLocation(self.currentLocation(), self.currentTab(), function(data) {

      var items = data.response.groups[0].items;
      if (items.length < 1) {
        self.inSearch(false);
        if (self.currentTab() === 'open') { // handle no open libraries
          alert("No open libraries now!, please try again later.");
        } else { // handle no results
          alert("No Libraries found!");
        }
        return;
      }

      // get suggested bounds from foursquare and update currentSuggestedBounds
      var suggestedBounds = data.response.suggestedBounds;
      self.currentSuggestedBounds(suggestedBounds);

      resizeMapToBounds(self.currentSuggestedBounds(), function() {
        // map is ready
        var totalDelay = items.length * 50; // total delay for all markers

        $.each(items, function(index, item) {
          var library = createLibraryFromItem(item);
          var delay = index * 50;

          // add markers after delay, raining effect
          setTimeout(function() {
            if (self.currentTab() === 'top') { // add numbered markers icons
              creatMarker(library(), self.currentTab(), index + 1);
            } else { // add normal markers icons
              creatMarker(library(), self.currentTab(), null);
            }

            // add to libraries arrays
            self.libraries.push(library);
            self.filteredLibraries.push(library);
          }, delay);
        });

        setTimeout(function() {
          self.inSearch(false); // search ended
          // if in mobile view, hide navbar after total delay, to let user notice badge changes
          if ($(window).width() < 768) {
            hideNavBar();
          }
        }, totalDelay);

      });

    }, function(error) { // handle errors

      var errorString;

      if (error.status === 0) { // request timed out
          errorString = "the request timed out please try again.";
        } else { // some other error
          errorString = error.statusText;
        }
      console.warn('Foursquare: ' + errorString);
      alert(errorString); // show error in alert to user
    });
  };

  // this function will be used to show library when choosed from table
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
appVM.query.subscribe(appVM.search); // subscribe to search

// Activates knockout.js
ko.applyBindings(appVM);
