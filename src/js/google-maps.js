var markers = [];
var map;

function initSearch() {
  var input = document.getElementById('pac_input');
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls.push(input);

  var options = {
    types: ['(cities)']
  };

  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener('place_changed', onPlaceChanged);

  function onPlaceChanged() {
    clearMarkers();

    // hide navbar
    if ($(window).width() < 768) {
      $('.navbar-toggle').click();
    }

    // get clicked place info from the autocomplete input
    var place = autocomplete.getPlace();

    // make sure that place has geometry infromation
    if (place.geometry) {

      // pan map to current place
      map.panTo(place.geometry.location);
      map.setZoom(12);

      // use foursquare API to check for libraries
      searchVenues(place.name, function(data) {
        // get venues from parsed data
        var venues = data.response.venues;

        // add marker for each venue
        $.each(venues, function(index, venue) {
          addMarkerWithDelay(venue, index * 50);
        });

      });
    }
  }
}


function initMap() {
  // Create a map object and specify the DOM element for display.
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
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function addMarkerWithDelay(venue, delay) {
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
      console.log(marker.title);
    });
    markers.push(marker);

  }, delay);

}
