import { IFCObject } from './ifcObjectEntity';
import { getConnection } from 'typeorm';


// Display list of all Authors.
export async function ifcObject_get_all(req, res) {
  const connectionManager = getConnection('todo_bdd').manager;
  const ifcObjects = await connectionManager.find(IFCObject).catch(error => {
    res.status(500);
    res.json({Success: false, Error: error});
  });
  res.status(200);
  res.json(ifcObjects);
}

export async function ifcObject_get_one(req, res) {
  const connectionManager = getConnection('todo_bdd').manager;
  const userRepository = connectionManager.getRepository(IFCObject);
  const ifcObject = await userRepository.findOneOrFail({oid: parseInt(req.params.oid, 10)}).catch(error => {
    res.status(500);
    res.json({Success: false, Error: error});
  });
  console.log(ifcObject);
  res.status(200);
  res.json(ifcObject);
}


export async function ifcObject_add(req, res) {
  try {
    const connectionManager = getConnection('todo_bdd').manager;
    const ifcObjectRepository = connectionManager.getRepository(IFCObject);
    const ifcObject = new IFCObject(
      parseInt(req.query.oid, 10),
      req.body.ifcId,
      req.body.name,
      req.body.SectionNature,
      req.body.sectionAnnexePiece,
      req.body.sectionAppartement,
      req.body.sectionBatiment,
      req.body.sectionEtage,
      req.body.sectionPiece,
      req.body.properties);
    const createdIfcObject = await ifcObjectRepository.save(ifcObject);
    res.json(createdIfcObject);

  } catch (e) {
    res.json(e);
  }
}

export async function ifcObject_update(req, res) {
  try {
    const connectionManager = getConnection('todo_bdd').manager;
    const userRepository = connectionManager.getRepository(IFCObject);
    const ifcObject = new IFCObject(
      parseInt(req.query.oid, 10),
      req.body.ifcId,
      req.body.name,
      req.body.SectionNature,
      req.body.sectionAnnexePiece,
      req.body.sectionAppartement,
      req.body.sectionBatiment,
      req.body.sectionEtage,
      req.body.sectionPiece,
      req.body.properties);
    await userRepository.update(ifcObject.oid, ifcObject).then(user => {
      res.status(204);
      res.json(user);
    });
  } catch (e) {
    res.json(e);
  }
}


// delete
export async function ifcObject_delete(req, res) {
  try {
    const connectionManager = getConnection('todo_bdd').manager;
    const ifcObjectRepository = connectionManager.getRepository(IFCObject);
    const result = await ifcObjectRepository.delete(parseInt(req.params.oid, 10));
    res.json(result);
  } catch (e) {
    res.json(e);
  }
}

