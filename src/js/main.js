function AppViewModel() {
  this.total = ko.observable(0);
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
