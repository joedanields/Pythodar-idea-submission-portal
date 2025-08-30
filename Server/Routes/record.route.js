import express from 'express';
import { createRecord, getRecord } from '../Controllers/record.controller.js';

const recordRoutes = express.Router();

recordRoutes.post('/create-record', createRecord);
recordRoutes.get('/get-record/:recordId', getRecord);

export default recordRoutes;