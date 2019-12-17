let ifcObject_express = require('express');
let ifcObjectRouter = ifcObject_express.Router();

// Require controller modules.
let ifcObjectController = require('./ifcObject');

/// ifcObject ROUTES ///

ifcObjectRouter.get('/', ifcObjectController.ifcObject_get_all);
ifcObjectRouter.get('/:id', ifcObjectController.ifcObject_get_one);
ifcObjectRouter.get('/todo/:id', function (req, res) {
  ifcObjectController.ifcObject_get_todos(req, res);
});
ifcObjectRouter.post('/', function(req, res) {
  ifcObjectController.ifcObject_add(req, res);
});
ifcObjectRouter.put('/:id', function(req, res) {
  ifcObjectController.ifcObject_update(req, res);
});
ifcObjectRouter.delete('/:id', function(req, res) {
  ifcObjectController.ifcObject_delete(req, res);
});

module.exports = ifcObjectRouter;
