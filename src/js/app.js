var marker;

function initMap() {
  // Create a map object and specify the DOM element for display.

  var initLocation = {
    lat: 41.0417,
    lng: 29.0094
  };
  var map = new google.maps.Map(document.getElementById('map'), {
    center: initLocation,
    disableDefaultUI: true,
    scrollwheel: true,
    zoom: 14
  });


  // dummy content:
  var contentString = '<h3>Dummy Info</h3><p>this is just a dummy text to check if marker info label is working.</p>';


  var infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 200
  });

  // Create a marker and set its position.
  marker = new google.maps.Marker({
    map: map,
    draggable: false,
    title: 'Marker Title',
    animation: google.maps.Animation.DROP,
    position: initLocation
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}

initMap();
$('#myMenu').on('show.bs.offcanvas', function(e) {
  if (!data) return e.preventDefault(); // stops menu from being shown
});

// hide navbar after a link is clicked
$('.nav a').on('click', function() {
  // check if device is mobile first
  if ($(window).width() < 768) {
    $('.navbar-toggle').click();
  }
});


<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAfzyLeFjKiBUipjWUL2AGEyLhVl2QOroE&libraries=places"></script>


AIzaSyAfzyLeFjKiBUipjWUL2AGEyLhVl2QOroE
