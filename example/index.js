// Authentication module for AngularJS  
// Copyright (C) 2013 Qloo Inc., Michael Diolosa <michael.diolosa@gmail.com>  
// License: MIT

/*global browser:true, angular:true */

(function () {
  'use strict';

  // private variables for mock server
  var apiAuthUrl = 'api/auth',
    _authenticated = false,
    _username = null,
    _id = null;

  angular
    .module('authtest', ['http-auth-interceptor', 'authentication', 'ngMockE2E'])

    // Mock Server
    // -----------
    // Mock the server responses, completely unneeded to use the code, it only
    // returns dummy values so no real server is needed.
    .run(['$httpBackend', function ($httpBackend) {

      // GET api/auth: Check to see if a user is logged in
      $httpBackend.whenGET(apiAuthUrl).respond(function (method, url, data) {
        if (_authenticated === true) {
          return [200, {username: _username, id: _id}];
        }

        return [401];
      });

      // POST api/auth: Login a user
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

      // DELETE api/auth: Logout a user
      $httpBackend.whenDELETE(apiAuthUrl).respond(function (method, url, data) {
        _authenticated = false;
        return [200];
      });
    }])

    // Module Configuration
    // --------------------
    // Configure the `authServiceProvider` with a URL handler that rejects
    // the `deferred` when a user POSTs to api/auth. A POST to api/auth is the
    // action for logging in a user.
    .config(['authServiceProvider',
      function (authServiceProvider) {
        authServiceProvider.whenPOST(apiAuthUrl, function (response, deferred) {
          deferred.reject(response);
          return true;
        });
      }])

    // signin
    // ------
    // Sign in form controller.
    //
    // If you click the `sign in` button with no values in `username` or
    // `password` the `signin-failed` event should be triggered.
    // 
    // To see the state of the form with a user signed in type anything into
    // both `username` and `password`
    //
    // You can then click `sign out` to deauthorize the user again
    .controller('signin', ['$http', '$rootScope', '$scope', 'principal', 'authority', 'authService',
      function ($http, $rootScope, $scope, principal, authority, authService) {

        // Store the principal for use in the template
        $scope.user = principal;

        // Models to store credentials
        $scope.username = '';
        $scope.password = '';

        // Model to store error messages
        $scope.message = null;

        // On startup this will fail since the user is not logged in,
        // once logged in the console will log some messages
        $http.get(apiAuthUrl).success(function (data) {
          console.log('received user data: ');
          console.dir(data);
        });

        // Sign in button handler
        $scope.signinButtonClick = function () {
          // Values to post to authentication service
          var body = {username: $scope.username, password: $scope.password};

          // Reset the error messages
          $scope.message = null;

          // POST values to the auth API
          $http
            .post(apiAuthUrl, body)
            .success(function (data) {
              // Tell authService that the user is logged in
              authService.loginConfirmed();
              // Tell the authority that the user is authorized
              authority.authorize(data);

              // Reset credential models
              $scope.username = '';
              $scope.password = '';
            })
            // This error message should only occur if there were no user
            // credentials supplied.
            .error(function () {
              $scope.message = 'Incorrect credentials';
              // Broadcast an event stating that sigin failed
              $rootScope.$broadcast('event:signin-failed');
            });
        };

        // Sign out button handler
        $scope.signoutButtonClick = function () {
          // Reset error messages
          $scope.message = '';

          // DELETE to the auth API
          $http
            ['delete'](apiAuthUrl)
            .success(function () {
              // Tell the authority that the user has been deauthorized.
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