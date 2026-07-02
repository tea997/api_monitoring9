import express from 'express';
import clientContainer from '../Dependencies/dependencies.js';
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = express.Router();
const { clientController } = clientContainer.controller;

// Route to get all clients (super admin only)
router.get('/admin/clients', authenticate, (req, res, next) => clientController.getClients(req, res, next));

// Route to create a new client
router.post('/admin/clients', authenticate, (req, res, next) => clientController.createClient(req, res, next));

// Route to create a new client user for a specific client
router.post('/admin/clients/:clientId/users', authenticate, (req, res, next) => clientController.createClientUser(req, res, next));

// Route to create a new API key for a specific client
router.post('/admin/clients/:clientId/api-keys', authenticate, (req, res, next) => clientController.createApiKey(req, res, next));

// Route to get all API keys for a specific client
router.get('/admin/clients/:clientId/api-keys', authenticate, (req, res, next) => clientController.getClientApiKeys(req, res, next));

export default router;