/* jshint -W024 */
/* jshint expr:true */

var expect = chai.expect;

describe('authentication', function() {
  beforeEach(module('authentication'));
  var username = 'tester', id = 10;

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).to.equal('1.0.4');
    }));
  });

  describe('principal', function () {
    it('should not be authenticated before authorization', inject(function (principal) {
      expect(principal.isAuthenticated()).to.equal(false);
    }));

    it('should not have user data before authorization', inject(function (principal) {
      expect(principal.identity().name).to.be.undefined;
      expect(principal.identity().id).to.be.undefined;
    }));

    it('should be authenticated after authorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.isAuthenticated()).to.be.true;
    }));

    it('should not have user data before authorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.identity().name()).to.equal(username);
      expect(principal.identity().id()).to.equal(id);
    }));

    it('should not be authenticated after deauthorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.isAuthenticated()).to.be.true;

      authority.deauthorize();
      expect(principal.isAuthenticated()).to.equal(false);
    }));

    it('should not have user data after deauthorization', inject(function (principal, authority) {
      authority.authorize({username:username, id:id});
      expect(principal.identity().name()).to.equal(username);
      expect(principal.identity().id()).to.equal(id);

      authority.deauthorize();
      expect(principal.identity().name).to.be.undefined;
      expect(principal.identity().id).to.be.undefined;
    }));

    it('should fill in user data correctly no matter how many times authorization and deauthorization occurs', inject(function (principal, authority) {
      var loopid;
      for (var i = 0, j = 100; i < j; i++) {
        loopid = (i % Math.round(j / 4));

        authority.authorize({username:username + loopid, id:id + loopid});
        expect(principal.identity().name()).to.equal(username + loopid);
        expect(principal.identity().id()).to.equal(id + loopid);

        authority.deauthorize();
        expect(principal.identity().name).to.be.undefined;
        expect(principal.identity().id).to.be.undefined;
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
    });

    it('should properly translate keys', inject(function (principal, authority) {

      expect(principal.identity().myname).to.be.undefined;
      expect(principal.identity().myid).to.be.undefined;
      expect(principal.identity().authorized).to.be.undefined;

      authority.authorize({username:username, id:id, success:true});

      expect(principal.identity().myname()).to.equal(username);
      expect(principal.identity().myid()).to.equal(id);
      expect(principal.identity().authorized()).to.be.true;
    }));

    it('should broadcast authorized event', inject(function ($rootScope, principal, authority) {
      var authorizedEmitted = false;

      $rootScope.$on('event:authority-authorized', function () {
        authorizedEmitted = true;
      });

      expect(authorizedEmitted).to.equal(false);

      authority.authorize({username:username, id:id, success:true});
      expect(authorizedEmitted).to.be.true;
    }));

    it('should broadcast authorized event', inject(function ($rootScope, principal, authority) {
      var deauthorizedEmitted = false;

      $rootScope.$on('event:authority-deauthorized', function () {
        deauthorizedEmitted = true;
      });

      expect(deauthorizedEmitted).to.equal(false);

      authority.authorize({username:username, id:id, success:true});

      authority.deauthorize();
      expect(deauthorizedEmitted).to.be.true;
    }));
  });
});
