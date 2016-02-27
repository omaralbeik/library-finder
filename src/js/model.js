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
  this.verified = ko.observable();
  this.status = ko.observable();
  this.url = ko.observable();
  this.mapMarker = ko.observable();
};
