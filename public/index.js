/*global browser:true, angular:true */

(function () {
  'use strict';

  angular
    .module('authtest', ['http-auth-interceptor', 'authentication'])
    .config(['authServiceProvider', 'authorityProvider',
      function (authServiceProvider, authorityProvider) {
        authServiceProvider.addUrlHandler(function (response, deferred) {
          var canHandle = response.config.url === 'api/auth';

          if (canHandle) { deferred.reject(response); }
          return canHandle;
        });
      }])
    .controller('signin', ['$scope', 'principal',
      function ($scope, principal) {
        $scope.user = principal;
        $scope.signinClick = function () {
          console.log('test');
        };
      }]);
}());