// constants will be used to compose the request for foursquare API
var foursquareConstants = {
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
  searchTimeOut: 7000 // request timeout is 7 seconds
};

var searchForLibrariesNearLocation = function(location, type, success, error) {

      var ajaxData = {
        client_id: foursquareConstants.clientId,
        client_secret: foursquareConstants.clientSecret,
        v: '20160230', // the "version" of the API expected from Foursquare
        query: 'library',
        ll: location.lat + ',' + location.lng,
        limit: foursquareConstants.limit,
        sort: 'popular',
        // radius: 1000, // enable for more accurate results (in meters)
        categoryId: [
          foursquareConstants.categories.library,
          foursquareConstants.categories.collegeLibrary
        ]
      };

      if (type === 'open') {
        ajaxData.openNow = true; // show only open libraries
      } else if (type === 'top') {
        ajaxData.limit = 10; // reduce number of results to first 10 only
      }

      $.ajax({
        url: foursquareConstants.baseURL + foursquareConstants.method,
        type: 'GET',
        dataType: 'json',
        data: ajaxData,
        timeout: foursquareConstants.searchTimeOut,
        success: success,
        error: error
      });
};

var createLibraryFromItem = function(item) {
  var venue = item.venue;
  var library = ko.observable(new Library());

  // set library's properties
  library().name(venue.name);
  library().id(venue.id);
  library().lat(venue.location.lat);
  library().lng(venue.location.lng);
  library().address(venue.location.address);
  library().verified(item.venue.verified);
  library().rating(venue.rating);
  library().ratingColor('#'+venue.ratingColor);
  library().contact(venue.contact);
  library().url(venue.url);
  library().usersCount(venue.stats.usersCount);

  // if hours available; save status to library's status property
  if (venue.hours !== undefined && venue.hours !== null) {
    library().status(venue.hours.status);
  }

  return library;
};
