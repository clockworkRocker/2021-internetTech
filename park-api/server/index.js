import express, { response } from 'express';
import { resolve } from 'path';
import { __dirname } from './utils.js';
import { readData, writeData } from './fileUtils.js'

const server = express();

const hostname = 'localhost';
const port = 4321;

const routelist = [];

/* ================ MIDDLEWARES ================ */
/* -------- Converting responses to JSON */
server.use(express.json());

/* -------- Logging -------- */
server.use((request, response, next) => {
  console.log(
    (new Date()).toISOString(),
    request.method,
    request.originalUrl
  );

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');


  next();
});

/* -------- Sending statics --------- */
server.use('/', express.static(
  resolve(__dirname, '..', 'public')
));

/* ================ ROUTES ================ */
/* -------- OPTIONS AllowCrossOrigin -------- */
server.options('/*', (request, response) => {
  const method = request.method;

  response
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    .setHeader('Access-Control-Allow-Headers', '*')
    .send();
});

/* -------- GET RouteList -------- */
server.get('/routelist', (request, response) => {
  response
    .setHeader('Content-type', 'application/json')
    .status(200)
    .json(routelist);
});

/* -------- POST addRoute -------- */
server.post('/routelist', async (request, response) => {
  console.log(request.body);
  const { newID, newType } = request.body;

  if (newID) {
    routelist.push({
      id: Number(newID),
      type: newType,
      stops: [],
      nextSID: 0
    });
    await writeData(routelist);

    response
      .setHeader('Content-type', 'application/json')
      .status(200)
      .json({
        info: `Added route ${newID}`
      });
  } else {
    response
      .setHeader('Content-type', 'application/json')
      .status(404)
      .json({
        info: `Invalid routeID: ${newID}`
      });
  }
});

/* -------- POST addStop -------- */
server.post('/routelist/:rid/stops', async (request, response) => {
  const { newName } = request.body;
  const rid = Number(request.params['rid']);

  if (routelist.findIndex(({ id }) => id === rid) < 0) {
    response
      .setHeader('Content-type', 'application/json')
      .status(404)
      .json({
        info: `Route with id ${rid} was not found`
      });

    return;
  }

  const index = routelist.findIndex((({ id }) => id === rid));
  routelist[index].stops.push({
    id: `R${routelist[index].id}S${routelist[index].nextSID}`,
    name: newName
  });
  routelist[index].nextSID++;

  await writeData(routelist);
  response
    .setHeader('Content-type', 'application/json')
    .status(200)
    .json({
      info: `Added stop ${newName} to route with id ${rid}`
    });
});

/* -------- PATCH editStop -------- */
server.patch('/routelist/:rid/stops/:sid', async (request, response) => {
  const { newName } = request.body;
  const rid = Number(request.params['rid']);
  const sid = request.params['sid'];
  response.setHeader('Content-type', 'application/json');

  const rindex = routelist.findIndex(({ id }) => id === rid);

  if (rindex < 0) {
    response.
      status(404)
      .json({
        info: `Route with id ${rid} was not found`
      });

    return;
  }

  const sIndex = routelist[rindex].stops.findIndex(({ id }) => id === sid);

  if (sIndex < 0) {
    response.
      status(404)
      .json({
        info: `Route with id ${rid} doesnt have a stop with id ${sid}`
      });

    return;
  }

  routelist[rindex].stops[sIndex].name = newName;
  await writeData(routelist);
  response
    .status(200)
    .json({
      info: `Stop with id ${sid} was renamed to ${newName}`
    })
});
/* -------- DELETE deleteStop -------- */
server.delete('/routelist/:rid/stops/:sid', async (request, response) => {
  const rid = Number(request.params['rid']);
  const sid = request.params['sid'];
  response.setHeader('Content-type', 'application/json');

  const rindex = routelist.findIndex(({ id }) => id === rid);

  if (rindex < 0) {
    response.
      status(404)
      .json({
        info: `Route with id ${rid} was not found`
      });

    return;
  }

  const sIndex = routelist[rindex].stops.findIndex(({ id }) => id === sid);

  if (sIndex < 0) {
    response.
      status(404)
      .json({
        info: `Route with id ${rid} doesnt have a stop with id ${sid}`
      });

    return;
  }

  routelist[rindex].stops.splice(sIndex, 1);

  await writeData(routelist);
  response
    .status(200)
    .json({
      info: `Stop with id ${sid} was deleted`
    })
});

/* -------- DELETE deleteRoute -------- */
server.delete('/routelist/', async (request, response) => {
  const { rid } = request.body;

  if (routelist.findIndex(({ id }) => id === rid) < 0) {
    response
      .setHeader('Content-type', 'application/json')
      .status(404)
      .json({
        info: `Route with id ${rid} was not found`
      });

    return;
  }

  const index = routelist.findIndex((({ id }) => id === rid));
  routelist.splice(index, 1);
  await writeData(routelist);

  response
    .setHeader('Content-type', 'application/json')
    .status(200)
    .json({
      info: `Deleted route with id ${rid}`
    });
});

/* ================ RUNNING SERVER ================ */
server.listen(port, hostname, async (err) => {
  if (err) {
    console.error('Error!', err);
    return;
  }

  console.log(`Server started at http://${hostname} on port ${port}`);

  const list = await readData();
  list.forEach((route) => {
    routelist.push(route);
  });

})