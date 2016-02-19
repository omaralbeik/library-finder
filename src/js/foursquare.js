function searchVenues(city, callback) {

  var categories = {
    library: '4bf58dd8d48988d12f941735',
    collegeLibrary: '4bf58dd8d48988d1a7941735'
  };

  var clientId = '05KBIJ3CKDQQUEQF14CJGLDP3D3P0X1ZIDL0AG5XHMKIX5AY';
  var clientSecret = 'GO4A1C0E1SI1RVFG20BT03D2YPITDSCTDMNPRDGYMAYLYJ4Y';
  var baseURL = 'https://api.foursquare.com/v2/';
  var method = 'venues/search';

  $.ajax({
      url: baseURL + method,
      type: 'GET',
      dataType: 'json',
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        v: '20160230',
        query: 'library',
        near: city,
        limit: '30',
        categoryId: [categories.collegeLibrary]
      },
      success: callback
    });
}
