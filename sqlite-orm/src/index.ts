import 'reflect-metadata';
import {createConnection} from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
const cors = require('cors');

const ifcObjectRouter = require('./ifcObject/ifcObjectController.ts');
createConnection().then(async connection => {
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());

  app.use(express.json());
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT,PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  app.use('/ifcObject', ifcObjectRouter);
  app.listen(3000, () => {
    console.log('Server started on port 3000!');
  });
}).catch(error => console.log(error));
