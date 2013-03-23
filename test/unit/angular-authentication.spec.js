describe('authentication', function() {
  var username = 'tester', id = 10;

  describe('version', function() {
    beforeEach(module('authentication'));

    it('should return current version', inject(function(version) {
      expect(version).toEqual('1.0.0');
    }));
  });

  describe('principal', function () {
    beforeEach(module('authentication'));

    it('should not be authenticated before authorization', inject(function (principal) {
      expect(principal.isAuthenticated()).toBe(false);
    }));

    it('should not have user data before authorization', inject(function (principal) {
      expect(principal.identity().name).toBe(undefined);
      expect(principal.identity().id).toBe(undefined);
    }));

    it('should be authenticated after authorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.isAuthenticated()).toBe(true);
    }));

    it('should not have user data before authorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.identity().name()).toBe(username);
      expect(principal.identity().id()).toBe(id);
    }));

    it('should not be authenticated after deauthorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.isAuthenticated()).toBe(true);

      authority.deauthorize();
      expect(principal.isAuthenticated()).toBe(false);
    }));

    it('should not have user data after deauthorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.identity().name()).toBe(username);
      expect(principal.identity().id()).toBe(id);

      authority.deauthorize();
      expect(principal.identity().name).toBe(undefined);
      expect(principal.identity().id).toBe(undefined);
    }));

    it('should fill in user data correctly no matter how many times authorization and deauthorization occurs', inject(function (principal, authority) {
      var loopid;
      for (var i = 0, j = 100; i < j; i++) {
        loopid = (i % Math.round(j / 4));

        authority.authorize({username:username + loopid, id:id + loopid});
        expect(principal.identity().name()).toBe(username + loopid);
        expect(principal.identity().id()).toBe(id + loopid);

        authority.deauthorize();
        expect(principal.identity().name).toBe(undefined);
        expect(principal.identity().id).toBe(undefined);
      }
    }));
  });

  describe('authority', function () {
    beforeEach(function () {
      angular.module('authentication').config(function (authorityProvider) {
        authorityProvider.identityKeys = {
          username: 'myname',
          id: 'myid',
          success: 'authorized'
        };
      });

      module('authentication');
    });

    it('should properly translate keys', inject(function (principal, authority) {
      expect(principal.identity().myname).toBe(undefined);
      expect(principal.identity().myid).toBe(undefined);
      expect(principal.identity().authorized).toBe(undefined);

      authority.authorize({username:username, id:id, success:true});

      expect(principal.identity().myname()).toBe(username);
      expect(principal.identity().myid()).toBe(id);
      expect(principal.identity().authorized()).toBe(true);
    }));

    it('should broadcast authorized event', inject(function ($rootScope, principal, authority) {
      var authorizedEmitted = false;

      $rootScope.$on('event:authority-authorized', function () {
        authorizedEmitted = true;
      });

      expect(authorizedEmitted).toBe(false);

      authority.authorize({username:username, id:id, success:true});
      expect(authorizedEmitted).toBe(true);
    }));

    it('should broadcast authorized event', inject(function ($rootScope, principal, authority) {
      var deauthorizedEmitted = false;

      $rootScope.$on('event:authority-deauthorized', function () {
        deauthorizedEmitted = true;
      });

      expect(deauthorizedEmitted).toBe(false);

      authority.authorize({username:username, id:id, success:true});

      authority.deauthorize();
      expect(deauthorizedEmitted).toBe(true);
    }));
  });
});