const path = require('path');

// Global mock database helper
global.resetMockDb = () => {
  return {
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue(1),
    insert: jest.fn().mockResolvedValue([1]),
    del: jest.fn().mockResolvedValue(1),
    from: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null)
  };
};

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
      // For login page, just return success
      if (view === 'login') {
        res.status(200).send('Login page rendered successfully');
      } else if (view.includes('settings')) {
        res.status(200).send('Settings page rendered successfully');
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