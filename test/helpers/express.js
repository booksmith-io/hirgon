const path = require('path');

// Helper to create Express app with proper configuration for testing
function create_test_app() {
  const express = require('express');
  const app = express();

  // Set up view engine like the real server
  app.set('view engine', 'ejs');
  app.set('views', path.resolve(__dirname, './../views'));

  // Body parsing middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Add body-parser middleware for compatibility
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: true }));

  // Mock request locals for templates
  app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.user = req.session ? req.session.user : null;
    res.locals.app = {
      name: 'Hirgon Test',
      url: 'http://localhost:3000'
    };
    res.locals.systemdata = {
      'settings:icon': { value: 'test-icon.png' }
    };
    if (req.url.includes('/api/')) {
      res.locals.api = true;
    }
    next();
  });

  // Mock the render method to avoid actual template rendering issues
  app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = function(view, locals) {
      // Store render arguments for inspection in tests
      res._renderView = view;
      res._renderLocals = locals;

      // For login page with errors, return error status
      if (view === 'login' && locals && locals.alert) {
        res.status(401).send('Login page with error rendered');
      } else if (view === 'login') {
        res.status(200).send('Login page rendered successfully');
      } else if (view.includes('settings')) {
        if (locals && locals.alert && locals.alert.type === 'danger') {
          if (locals.alert.message.includes('update')) {
            res.status(500).send('Settings error rendered');
          } else {
            res.status(401).send('Password error rendered');
          }
        } else {
          res.status(200).send('Settings page rendered successfully');
        }
      } else if (view === 'home') {
        res.status(200).send('Home page rendered successfully');
      } else {
        res.status(200).send('Page rendered successfully');
      }
    };
    next();
  });

  return app;
}

module.exports = { create_test_app };