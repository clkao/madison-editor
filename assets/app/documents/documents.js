'use strict';

var app = angular.module("myApp.documents", ['xeditable']);

//OPTIONAL! Set socket URL!
// app.config(['$sailsProvider', function ($sailsProvider) {
//     $sailsProvider.url = 'http://localhost:1337';
// }]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/documents', {
    templateUrl: 'app/documents/list.html',
    controller: 'DocumentListController'
  });
  $routeProvider.when('/documents/:slug', {
    templateUrl: 'app/documents/detail.html',
    controller: 'DocumentDetailController'
  });
}]);

app.controller("DocumentListController", function ($scope, $http, $routeParams, $location) {
  $scope.documents = [];
  console.log('list');
  $http.get("/api/docs/")
    .success(function (data) {
      $scope.documents = data.documents;
    })
    .error(function (data) {
      alert('Houston, we got a problem!');
    });

  $scope.showForm = false;
  $scope.title = 'Untitled Document';
  $scope.showCreateForm = function(){
    $scope.showForm = true;
  };

  $scope.newDocument = '';
  $scope.createDocument = function(){
    if(!$scope.title){
      $scope.title = 'Untitled Document';
    }
    var doc = {document: {'title': $scope.title}};

    $http.post("/api/docs/", doc)
      .success(function (data) {
        console.log(data.document, data.document.slug);
        $location.path('/documents/' + data.document.slug);
      })
      .error(function (data) {
        alert('Houston, we got a problem!');
      });
  }

  $scope.deleteConfirmOpen = [];

  $scope.openDeleteConfirm = function(doc) {
    $scope.deleteConfirmOpen[doc.id] = true;
  }

  $scope.closeDeleteConfirm = function(doc) {
    $scope.deleteConfirmOpen[doc.id] = false;
  }

  $scope.deleteDocument = function(doc) {
    // Do document deletion here.
    $scope.closeDeleteConfirm(doc);
  }

});

app.controller("DocumentDetailController", function ($scope, $http, $routeParams) {
  console.log('detail');
  $http.get("/api/docs/" + $routeParams.slug)
    .success(function (data) {
      $scope.document = data.document;

      // Watch for changes to the title.
      $scope.$watch('document.title', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('value changed!', newVal, oldVal);
          $http.put("/api/docs/" + $scope.document.slug, {document: {title: newVal}})
            .success(function (data) {
              console.log(data);
            })
            .error(function (data) {
              alert('Houston, we got a problem!');
            });
        }
      });
    })
    .error(function (data) {
      alert('Houston, we got a problem!');
    });
});

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
