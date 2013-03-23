(function () {
  'use strict';

  describe('angular-authentication', function () {
    beforeEach(function () {
      browser().navigateTo('/');
    });

    it('should display an error message because no credentials were passed', function () {
      expect(element('#sign-out:hidden').count()).toBe(1);
      element('#sign-in-button').click();
      expect(element('#error-message').text()).toBe('Incorrect credentials');
    });

    it('should display user information when credentials are passed', function () {
      var username = 'tester';
      expect(element('#sign-out:hidden').count()).toBe(1);

      expect(element('#user-is-authenticated').text()).toBe('false');
      expect(element('#user-name').text()).toBe('');
      expect(element('#user-id').text()).toBe('');

      input('username').enter(username);
      input('password').enter(username);
      element('#sign-in-button').click();

      expect(element('#error-message:hidden').count()).toBe(1);
      expect(element('#sign-out:hidden').count()).not().toBe(1);

      expect(element('#user-is-authenticated').text()).toBe('true');
      expect(element('#user-name').text()).toBe(username);
      expect(element('#user-id').text()).not().toBe('');
    });

    it('should remove user information when logged out', function () {
      var username = 'tester';

      input('username').enter(username);
      input('password').enter(username);
      element('#sign-in-button').click();

      expect(element('#user-is-authenticated').text()).toBe('true');
      expect(element('#user-name').text()).toBe(username);
      expect(element('#user-id').text()).not().toBe('');

      element('#sign-out-button').click();

      expect(element('#user-is-authenticated').text()).toBe('false');
      expect(element('#user-name').text()).toBe('');
      expect(element('#user-id').text()).toBe('');
    });
  });

}());