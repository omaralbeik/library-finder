var map, autocomplete;
var infowindow;

var setCurrentLocation = function(success, error) {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  navigator.geolocation.getCurrentPosition(success, error, options);
};

var setMap = function(location, mapReady) {

  if (typeof google === 'undefined') {
    $('#map').remove();
    $('#table-button').remove();
    $('li').addClass('disabled');
    $('input').prop('disabled', true);
    $('body').append('<h3 class="error">Google Maps not available!, try again later.</h3>');
    console.log('not available');
    return;

  } else {

    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
      center: location,
      disableDefaultUI: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      scrollwheel: true, // allo zooming by scrolling
      zoom: 12
    });

    var input = document.getElementById('input');
    var searchBox = new google.maps.places.SearchBox(input);
    autocomplete = new google.maps.places.Autocomplete(input);

    google.maps.event.addListenerOnce(map, 'idle', mapReady);

  }

};

var resizeMapToBounds = function(bounds, mapReady) {

  // create a new empty bounds
  var bnds = new google.maps.LatLngBounds();

  // get north east bounds from suggestedBounds
  var ne = bounds.ne;

  // get south west bounds from suggestedBounds
  var sw = bounds.sw;

  // extend bounds to fit ne and sw
  bnds.extend(new google.maps.LatLng(ne.lat, ne.lng));
  bnds.extend(new google.maps.LatLng(sw.lat, sw.lng));

  // fit bounds into map
  map.fitBounds(bnds);
  google.maps.event.addListenerOnce(map, 'idle', mapReady);

  window.onresize = function() {
    map.fitBounds(bnds); // `bounds` is a `LatLngBounds` object
  };

};

var creatMarker = function(library, currentTab, rate) {
  var icon;
  if (currentTab === 'top') { // use numbered marker images
    icon = 'img/markers/marker' + rate + '.png';
  } else { // use normal marker image
    if (library.verified()) {
      icon = 'img/markers/marker_ver.png';
    } else {
      icon = 'img/markers/marker.png';
    }
  }
  var marker = new google.maps.Marker({
    map: map,
    draggable: false,
    title: library.name(),
    animation: google.maps.Animation.DROP,
    icon: icon,
    position: {
      lat: library.lat(),
      lng: library.lng()
    }
  });

  marker.addListener('click', function() {

    animateAllMarkers(null);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    infowindow.close();
    infowindow = createInfowindowForLibrary(library);

    // add close button event handler
    google.maps.event.addListener(infowindow, "closeclick", function() {
      animateAllMarkers(null); // stop animation for all markers
    });

    // open info window when marker is clicked
    infowindow.open(map, marker);

  });

  library.mapMarker(marker);
};

var animateAllMarkers = function(animation) {
  $.each(appVM.libraries(), function(index, library) {
    if (animation === 'bounce') {
      library().mapMarker().setAnimation(google.maps.Animation.BOUNCE);
    } else if (animation === 'drop') {
      library().mapMarker().setAnimation(google.maps.Animation.DROP);
    } else {
      library().mapMarker().setAnimation(null);
    }
  });
};

var createInfowindowForLibrary = function(library) {
  var infowindow = new google.maps.InfoWindow({
    content: generateInfoWindowContent(library),
    maxWidth: 280
  });
  return infowindow;
};

var generateInfoWindowContent = function(library) {

  var info = library.verified() ?
    info_name.replace('%name%', library.name()).replace('%verified_icon%', '<i class="fa fa-certificate"></i>').replace('%verified%', '(verified)') :
    info_name.replace('%name%', library.name()).replace('%verified_icon%', '').replace('%verified%', '');

  // if status is available, add it to info window
  if (library.status()) {
    info += info_status.replace('%status%', library.status());
  }

  // if address is available, add it to info window
  if (library.address()) {
    info += info_address.replace('%address%', library.address());
  }

  // if rating is available, add it to info window
  if (library.rating()) {
    info += info_rating
      .replace('%rating%', library.rating())
      .replace('%color%', library.ratingColor())
      .replace('%users%', library.usersCount());
  }

  // initialize contact details unordered list
  var contact = $(info_contact);


  // if url is available add it to contact ul
  if (library.url()) {
    contact.append(info_url.replace('%url%', library.url()));
  }

  // if phone number is available add it to contact ul
  if (library.contact().phone) {
    contact.append(info_phone.replace('%phone%', library.contact().phone));
  }

  // if facebook url is available add it to contact ul
  if (library.contact().facebook) {
    contact.append(info_facebook.replace('%id%', library.contact().facebook));
  }

  // if twitter url is available add it to contact ul
  if (library.contact().twitter) {
    contact.append(info_twitter.replace('%name%', library.contact().twitter));
  }

  // foursquare id is always available, no need to check
  contact.append(info_foursquare.replace('%id%', library.id()));

  var container = $(info_contact_container);
  container.append(contact);
  return info + container.html(); // return all html as string

};

var isPlaceValid = function(place) {
  if (place === null || place === undefined) {
    return false;
  } else if (place.geometry === null || place.geometry === undefined) {
    return false;
  } else if (place.geometry.location === null || place.geometry.location === undefined) {
    return false;
  }
  return true;
};
