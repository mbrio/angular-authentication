# AngularJS Authentication Module

This module provides a means for managing the authentication and identity of a user in AngularJS.

**The current implementation is in flux, but is nearly stable.**

## TODO for V1

- All comments need to be updated
- Remove reliance on `angular-http-interceptor`, I feel this is an implementation thing and should not be part of the library. I will keep the use of this component in the example application though.

## TODO for V1.1

- Add tests
- Flesh out the README.md file
- Add documentation generator through Grunt build, not sure if this is overkill yet, depends on if I'm going to add more to the build process.

## TODO for V2

- Multiple identity support
- Roles support

## Example Application

To get the example application working:

```
$ cd example
$ bower install
```

You can then launch `example/index.html` in your browser.

## License

License
---
Copyright (c) 2013 Qloo inc., Michael Diolosa <[michael.diolosa@gmail.com](michael.diolosa@gmail.com)>

The adn2do application is licensed under the [MIT license](http://opensource.org/licenses/MIT).