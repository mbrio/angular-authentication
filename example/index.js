/*global browser:true, angular:true */

(function () {
  'use strict';

  var apiAuthUrl = 'api/auth',
    _authenticated = false,
    _username = null,
    _id = null;

  angular
    .module('authtest', ['http-auth-interceptor', 'authentication', 'ngMockE2E'])

    // Mock the server responses
    .run(['$httpBackend', function ($httpBackend) {
      $httpBackend.whenGET(apiAuthUrl).respond(function (method, url, data) {
        if (_authenticated === true) {
          return [200, {username: _username, id: _id}];
        }

        return [401];
      });

      $httpBackend.whenPOST(apiAuthUrl).respond(function (method, url, data) {
        data = angular.fromJson(data);

        if (data.username && data.password) {
          _authenticated = true;
          _username = data.username;
          _id = Math.round(Math.random() * 1000 + 1);
          return [200, {username: _username, id: _id, success: true}];
        }

        _authenticated = false;
        return [401, {success: false}];
      });

      $httpBackend.whenDELETE(apiAuthUrl).respond(function (method, url, data) {
        _authenticated = false;
        return [200];
      });
    }])

    // Configure my authority provider with a URL handler
    .config(['authServiceProvider', 'authorityProvider',
      function (authServiceProvider, authorityProvider) {
        authServiceProvider.whenPOST(apiAuthUrl, function (response, deferred) {
          deferred.reject(response);
          return true;
        });
      }])

    .controller('signin', ['$http', '$rootScope', '$scope', 'principal', 'authority',
      function ($http, $rootScope, $scope, principal, authority) {
        $scope.user = principal;

        $scope.username = '';
        $scope.password = '';
        $scope.message = null;

        $http.get(apiAuthUrl).success(function (data) {
          console.log('received user data: ');
          console.dir(data);
        });

        // sign in button handler
        $scope.signinButtonClick = function () {
          var body = {username: $scope.username, password: $scope.password};

          $scope.message = null;

          $http
            .post(apiAuthUrl, body)
            .success(function (data) {
              authority.authorize(data);
              $scope.username = '';
              $scope.password = '';
            })
            .error(function () {
              $scope.message = 'Incorrect credentials';
              $rootScope.$broadcast('event:signin-failed');
            });
        };

        // sign out button handler
        $scope.signoutButtonClick = function () {
          $scope.message = '';

          $http
            .delete(apiAuthUrl)
            .success(function () {
              authority.deauthorize();
            });
        };

        // These events are fired by the authService provider, they're pretty
        // self explanatory
        $scope.$on('event:auth-loginRequired', function () {
          console.log('need login');
        });

        $scope.$on('event:auth-loginConfirmed', function () {
          console.log('logged in');
        });

        $scope.$on('event:signin-failed', function () {
          console.log('incorrect credentials');
        });

        $scope.$on('event:authority-authorized', function () {
          console.log('authorized');
        });

        $scope.$on('event:authority-deauthorized', function () {
          console.log('deauthorized');
        });
      }]);
}());