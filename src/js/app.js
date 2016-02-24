// Model
var Library = function() {
  this.name = ko.observable();
  this.id = ko.observable();
  this.lat = ko.observable();
  this.lng = ko.observable();
  this.address = ko.observable();
  this.rating = ko.observable();
  this.ratingColor = ko.observable();
  this.usersCount = ko.observable();
  this.contact = ko.observable();
  this.status = ko.observable();
  this.url = ko.observable();
  this.mapMarker = ko.observable();
  this.markerInfoWindow = ko.observable();
};

// AppViewModel
function AppViewModel() {

  // global variables
  var self = this;
  var map, autocomplete, bounds;

  // all current libraries will be stored in the libraries array
  self.libraries = ko.observableArray();

  // suggested bounds for the latest search, from foursquare
  self.currentSuggestedBounds = ko.observable();

  // current active tab in navbar // initially all
  self.currentTab = ko.observable('all');

  // current place confirmed from google places autocomplete input
  self.currentPlace = ko.observable();

  // inSearch boolean changes to true when there is an active request,
  // and when the request ends or fails, inSearch becomes false again
  self.inSearch = ko.observable(false);


  /********************* Search Methods *********************/
  // search for all libraries, called from html data-bind
  self.searchAll = function() {
    // change current tab to the all tab
    self.currentTab('all');
    // make sure current places info available
    if (self.isCurrentPlaceAvailable()) {
      self.searchLibraries();
    } else { // otherwise present error to user
      self.showNoPlaceFoundPopover();
    }
  };

  // search for currently open libraries, called from html
  self.searchOpen = function() {
    // change current tab to the open tab
    self.currentTab('open');
    // make sure current places info available
    if (self.isCurrentPlaceAvailable()) {
      self.searchLibraries();
    } else { // otherwise present error to user
      self.showNoPlaceFoundPopover();
    }
  };

  // search for the top 10 libraries, called from html
  self.searchTop = function() {
    // change current tab to the top 10 tab
    self.currentTab('top');
    // make sure current places info available
    if (self.isCurrentPlaceAvailable()) {
      self.searchLibraries();
    } else { // otherwise present error to user
      self.showNoPlaceFoundPopover(true);
    }
  };


  /********************* Google Maps *********************/

  // Create a map object and specify the DOM element for display.
  self.initMap = function() {

    // initial location for map to Bahçeşehir University, Istanbul
    var initLocation = {
      lat: 41.0417,
      lng: 29.0094
    };

    map = new google.maps.Map(document.getElementById('map'), {
      center: initLocation,
      disableDefaultUI: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      scrollwheel: true, // allo zooming by scrolling
      zoom: 12
    });

  }(); // () used to run the function as soon as script is called


  // clearLibraries function is used to delete all markers on map
  self.clearLibraries = function() {
    // delete all markers
    $.each(self.libraries(), function(index, library) {
      library().mapMarker().setMap(null);
    });

    // empty libraries array
    self.libraries.removeAll();
  };

  // addMarkerWithDelay function is used to create a merker with delay
  self.addMarkerWithDelay = function(library, rate, delay) {

    window.setTimeout(function() {
      var icon;
      if (self.currentTab() === 'top') { // use numbered marker images
        icon = 'img/markers/marker' + rate + '.png';
      } else { // use normal marker image
        icon = 'img/markers/marker.png';
      }

      var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        title: library().name(),
        animation: google.maps.Animation.DROP,
        icon: icon,
        position: {
          lat: library().lat(),
          lng: library().lng()
        }
      });

      var infowindow = new google.maps.InfoWindow({
        content: self.generateInfoString(library),
        maxWidth: 280
      });

      // add close button event handler
      google.maps.event.addListener(infowindow, 'closeclick', function() {
        marker.setAnimation(null); // stop animation
      });

      library().markerInfoWindow(infowindow);

      marker.addListener('click', function() {

        // bounce marker
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // open info window when marker is clicked
        infowindow.open(map, marker);
      });
      // save created marker to library's mapMarker
      library().mapMarker(marker);
    }, delay); // run this function after delay passed
  };

  // stop all markers animation
  self.stopMarkersAnimation = function() {
    $.each(self.libraries(), function(index, library) {
      library().mapMarker().setAnimation(null);
    });
  };

  // close all info windows for all markers
  self.closeAllMarkersInfoWindows = function() {
    $.each(self.libraries(), function(index, library) {
      library().markerInfoWindow().close(map, library().mapMarker());
    });
  };

  // resize map back to latest suggested bounds
  self.resizeMapToSuggestedBounds = function() {

    // create a new empty bounds
    var bounds = new google.maps.LatLngBounds();

    // get north east bounds from suggestedBounds
    var ne = self.currentSuggestedBounds().ne;

    // get south west bounds from suggestedBounds
    var sw = self.currentSuggestedBounds().sw;

    // extend bounds to fit ne and sw
    bounds.extend(new google.maps.LatLng(ne.lat, ne.lng));
    bounds.extend(new google.maps.LatLng(sw.lat, sw.lng));

    // fit bounds into map
    map.fitBounds(bounds);
  };

  // this method generate info window html contents
  self.generateInfoString = function(library) {

    // set name
    var info = info_name.replace('%name%', library().name());

    // if status is available, add it to info window
    if (library().status() !== undefined && library().status() !== null) {
      info += info_status.replace('%status%', library().status());
    }

    // if address is available, add it to info window
    if (library().address() !== undefined && library().address() !== null) {
      info += info_address.replace('%address%', library().address());
    }

    // if rating is available, add it to info window
    if (library().rating() !== undefined && library().rating() !== null) {
      info += info_rating.replace('%rating%', library().rating())
        .replace('%color%', library().ratingColor())
        .replace('%users%', library().usersCount());
    }

    // initialize contact details unordered list
    var contact = $(info_contact);

    // if url is available add it to contact ul
    if (library().url() !== undefined && library().url() !== null) {
      contact.append(info_url.replace('%url%', library().url()));
    }

    // if phone number is available add it to contact ul
    if (library().contact().phone !== undefined && library().contact().phone !== null) {
      contact.append(info_phone.replace('%phone%', library().contact().phone));
    }

    // if facebook url is available add it to contact ul
    if (library().contact().facebook !== undefined && library().contact().facebook !== null) {
      contact.append(info_facebook.replace('%id%', library().contact().facebook));
    }

    // if twitter url is available add it to contact ul
    if (library().contact().twitter !== undefined && library().contact().twitter !== null) {
      contact.append(info_twitter.replace('%name%', library().contact().twitter));
    }

    // foursquare id is always available, no need to check
    contact.append(info_foursquare.replace('%id%', library().id()));

    var container = $(info_contact_container);
    container.append(contact);

    return info + container.html(); // return all html as string
  };


  /********************* Google Places *********************/

  // this function gets place information from input and assign it back to
  // global variable currentPlace
  self.getPlaceFromInput = function() {

    if (!self.inSearch()) { // if not in the middle of another request

      // clear all libraries
      self.clearLibraries();

      // clear table
      self.clearTable();

      // get clicked place info from the autocomplete input
      self.currentPlace(self.autocomplete.getPlace());

      if (self.currentPlace().geometry) { // place has geometry infromation

        // use foursquare API to check for libraries
        self.searchLibraries();

      } else { // palce couldn't be geocoded; show error popover
        self.showNoPlaceFoundPopover();
      }
    }
  };

  // initialize autocompletion text input
  self.initSearch = function() {

    var input = document.getElementById('input');
    var searchBox = new google.maps.places.SearchBox(input);

    self.autocomplete = new google.maps.places.Autocomplete(input);
    self.autocomplete.addListener('place_changed', self.getPlaceFromInput);
  }(); // () used to run the function as soon as script is called


  /********************* Foursquare *********************/

  // constants will be used to compose the request for foursquare API
  this.foursquareConstants = {
    clientId: '05KBIJ3CKDQQUEQF14CJGLDP3D3P0X1ZIDL0AG5XHMKIX5AY',
    clientSecret: 'GO4A1C0E1SI1RVFG20BT03D2YPITDSCTDMNPRDGYMAYLYJ4Y',
    baseURL: 'https://api.foursquare.com/v2/',
    method: 'venues/explore',
    categories: {
      // list of allowed categories, for more info:
      // https://developer.foursquare.com/categorytree
      library: '4bf58dd8d48988d12f941735',
      collegeLibrary: '4bf58dd8d48988d1a7941735'
    },
    limit: 100, // total results limit
    animationDelay: 50 // wait 50 ms before the next marker drops
  };

  // this method is used to search for libraries via foursquare API
  self.searchLibraries = function() {

    // first things first, delete any old markers and table
    self.clearLibraries();
    self.clearTable();

    self.inSearch(true); // request started
    self.setTabLoading(true); // start loading current tab

    if (self.currentPlace().geometry === null ||
      self.currentPlace().geometry === undefined) {
      return; // current place is not geocoded
    } else if (self.currentPlace().geometry.location === null
    || self.currentPlace().geometry.location === undefined) {
      return; // any other problem
    }

    var location = self.currentPlace().geometry.location;

    var ajaxData = {
      client_id: self.foursquareConstants.clientId,
      client_secret: self.foursquareConstants.clientSecret,
      v: '20160230', // the "version" of the API expected from Foursquare
      query: 'library',
      ll: location.lat() + ',' + location.lng(),
      limit: self.foursquareConstants.limit,
      sort: 'popular',
      // radius: 1000, // enable for more accurate results (in meters)
      categoryId: [
        self.foursquareConstants.categories.library,
        self.foursquareConstants.categories.collegeLibrary
      ]
    };

    if (self.currentTab() === 'open') {
      ajaxData.openNow = true; // show only open libraries
    } else if (self.currentTab() === 'top') {
      ajaxData.limit = 10; // reduce number of results to first 10 only
    }

    $.ajax({
      url: self.foursquareConstants.baseURL + self.foursquareConstants.method,
      type: 'GET',
      dataType: 'json',
      data: ajaxData,
      timeout: 7000, // set request timeout to 7 seconds
      success: function(data) {

        if (data.response.totalResults < 1) { // 0 results found
          var message;
          if (self.currentTab() === 'open') { // no open libraries
            message = 'No libraries is open now near ' + self.currentPlace().name;
          } else { // no libraries
            message = 'No libraries found near ' + self.currentPlace().name;
          }

          self.inSearch(false); // finished search
          self.setTabLoading(false); // hide loading tab
          alert(message); // show error alert
          return; // exit the method
        }

        // get suggested bounds from foursquare
        self.currentSuggestedBounds(data.response.suggestedBounds);

        // resize map to fit all results
        self.resizeMapToSuggestedBounds();

        // get items from parsed data
        var items = data.response.groups[0].items;

        // create a Library item for each item, and push it to libraries array
        $.each(items, function(index, item) {
          var venue = item.venue;

          var library = ko.observable(new Library());

          // set library's properties
          library().name(venue.name);
          library().id(venue.id);
          library().lat(venue.location.lat);
          library().lng(venue.location.lng);
          library().address(venue.location.address);
          library().rating(venue.rating);
          library().ratingColor(venue.ratingColor);
          library().contact(venue.contact);
          library().url(venue.url);
          library().usersCount(venue.stats.usersCount);

          // if hours available; save status to library's status property
          if (venue.hours !== undefined && venue.hours !== null) {
            library().status(venue.hours.status);
          }

          if (self.currentTab() == 'top') {
            self.addMarkerWithDelay(library, (index + 1).toString(),
            index * self.foursquareConstants.animationDelay);
          } else {
            self.addMarkerWithDelay(library, "",
            index * self.foursquareConstants.animationDelay);
          }

          setTimeout(function() {
            self.inSearch(false); // search finished
            self.setTabLoading(false); // remove loading from current tab
            self.hideNavBar(); // hide navbar if in mobile view
          }, items.length * self.foursquareConstants.animationDelay);

          // add library to libraries table
          self.addLibraryToTable(library);

          // push library to array after delay, to make the illusion of numbers
          // increasing in current tab
          setTimeout(function() {
            self.libraries.push(library);
          }, index * self.foursquareConstants.animationDelay);

        });
      },
      // excutes if the request failed
      fail: function(error) {
        self.inSearch(false); //finish search
        self.setTabLoading(false); // remove loading from current tab
        self.hideNavBar(); // hide navbar if in mobile view
        console.log(error); // log the error to console for debugging
      },
      // excute if there is an error in request
      error: function(error) {

        self.inSearch(false); //finish search
        self.setTabLoading(false); // remove loading from current tab
        self.hideNavBar(); // hide navbar if in mobile view

        var errorString;

        if (error.status === 0) { // request timed out
          errorString = "the request timed out please try again.";
        } else { // some other error
          errorString = error.statusText;
        }

        alert(errorString); // show error in alert to user
      }
    });

  };


  /********************* Table *********************/
  self.addLibraryToTable = function(library) {

    var $tr = $('<tr>');
    var $td = $('<td>');

    $td.append(table_name.replace('%name%', library().name()));

    if (library().address() !== undefined && library().address() !== null) {
      $td.append(table_address.replace('%address%', library().address()));
    }

    // if status is available, add it to address
    if (library().status() !== undefined && library().status() !== null) {
      $td.append(table_status.replace('%status%', library().status()));
    }

    // if rating is available, add it
    if (library().rating() !== undefined && library().rating() !== null) {
      $td.append(table_rating.replace('%rating%', library().rating())
        .replace('%color%', library().ratingColor())
        .replace('%users%', library().usersCount()));
    }

    $td.click(function(event) {

      // stop all old bouncing markers
      self.stopMarkersAnimation();

      // bounce selected marker
      library().mapMarker().setAnimation(google.maps.Animation.BOUNCE);

      // change map's center
      map.setCenter(new google.maps.LatLng(
        library().mapMarker().position.lat(),
        library().mapMarker().position.lng()
      ));

      map.setZoom(16);

      // close all open info windows
      self.closeAllMarkersInfoWindows();

      // open info window for clicked library's marker
      library().markerInfoWindow().open(map, library().mapMarker());

      // if in mobile view hide table
      if ($(window).width() < 768) {
        self.toggleTable();
      }

    });

    $tr.append($td);
    $('#table').append($tr);

  };

  // this method delete all row in table and keeps the search form (first row)
  self.clearTable = function() {
    $('#table').find("tr:gt(0)").remove();
  };

  self.searchTable = function(searchString) {

    // clear table
    self.clearTable();

    $.each(self.libraries(), function(index, library) {

      // change searchString and library's name to lower string
      var lowerString = searchString.toLowerCase();
      var lowerName = library().name().toLowerCase();

      if (self.wordInString(lowerName, lowerString)) {
        // add this library to table
        self.addLibraryToTable(library);
      }
    });
  };

  self.toggleTable = function() {
    $('.table-container').toggle('drop');
    $('#table-button').toggleText('<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span> Hide List',
      '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span> Show List');
  };


  /********************* Helpers *********************/
  self.showNoPlaceFoundPopover = function() {
    $('#input').popover('show');
    setTimeout(function() {
      $('#input').popover('destroy');
    },2000);
  };

  // returns tru if string contains given word
  self.wordInString = function(s, word) {
    return new RegExp(word, 'i').test(s); // regular expression
  };

  // helper method to check if current place is available and geocoded
  self.isCurrentPlaceAvailable = function() {
    if (self.currentPlace() === null || self.currentPlace() === undefined) {
      return false;
    } else if (self.currentPlace().geometry === null ||
    self.currentPlace().geometry === undefined) {
      return false;
    } else if (self.currentPlace().geometry.location === null ||
    self.currentPlace().geometry.location === undefined) {
      return false;
    }
    return true;
  };

  // helper method to add loading spinner to active tab when in request
  self.setTabLoading = function(loading) {

    if (loading) { // show spinner
      if (self.currentTab() === 'all') {
        $('#all-button')
        .prepend('<i class="fa fa-circle-o-notch fa-spin"></i>');
      }
      if (self.currentTab() === 'open') {
        $('#open-button')
        .prepend('<i class="fa fa-circle-o-notch fa-spin"></i>');
      }
      if (self.currentTab() === 'top') {
        $('#top-button')
        .prepend('<i class="fa fa-circle-o-notch fa-spin"></i>');
      }
    } else { // hide spinner
      $('i.fa-spin').remove();
    }
  };

  // helper method to hide navbar in mobile view
  self.hideNavBar = function() {
    if ($('.navbar-collapse').hasClass("in")) {
      $('.navbar-toggle').click();
    }
  };

  // add clear button to input
  $('input').addClear();

  // handle show table button click
  $('#table-button').click(function(event) {
    /* Act on the event */
    $('#table-button').toggleClass('active');

    if (self.libraries().length > 0) {

      self.toggleTable();

      if ($(window).width() >= 768) { // in mobile view

        // resize map back to last suggested bounds
        if (self.currentSuggestedBounds() !== null &&
        self.currentSuggestedBounds() !== undefined) {
          self.resizeMapToSuggestedBounds();
        }

        // close all open info windows
        self.closeAllMarkersInfoWindows();

        // stop all bouncing markers
        self.stopMarkersAnimation();
      }

    } else { // show pop over error to user
      $('#table-button').popover('show');
      setTimeout(function() {
        $('#table-button').popover('destroy');
      }, 2000);
    }

  });

  // hide table container initially
  $('.table-container').hide();
  $('.table-container').removeClass('hidden');

  // hide navbar if map clicked, when in mobile view
  $('#map').click(function(event) {
    var clickover = $(event.target);
    var $navbar = $(".navbar-collapse");
    var _opened = $navbar.hasClass("in");
    if (_opened === true && !clickover.hasClass("navbar-toggle")) {
      $navbar.collapse('hide');
    }
  });

  // handle input from table input
  $('.table-input').on('input', function() {
    self.searchTable($('.table-input').val());
  });

}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
