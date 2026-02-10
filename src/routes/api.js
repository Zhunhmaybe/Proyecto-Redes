const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');
const accountController = require('../controllers/accountController');
const transactionController = require('../controllers/transactionController');

// Client Routes
router.get('/clients', clientController.getAllClients);
router.get('/clients/:id', clientController.getClientById);
router.post('/clients', clientController.createClient);
router.put('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);

// Account Routes
router.get('/accounts', accountController.getAllAccounts);
router.get('/accounts/:id', accountController.getAccountById);
router.post('/accounts', accountController.createAccount);

// Transaction Routes
router.post('/transactions/deposit', transactionController.deposit);
router.post('/transactions/withdraw', transactionController.withdraw);
router.post('/transactions/transfer', transactionController.transfer);

// Employee Routes
const employeeController = require('../controllers/employeeController');
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.post('/auth/login', employeeController.login);

// Restore Routes
const restoreController = require('../controllers/restoreController');
router.get('/backups', restoreController.listBackups);
router.post('/restore', restoreController.restoreBackup);
router.post('/nuke', restoreController.nukeDatabase);

// Backup Routes - Lista de backups locales
const backupService = require('../services/backupService');
router.get('/backup/list', async (req, res) => {
    try {
        const backups = await backupService.listBackups();
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear backup manual
router.post('/backup/create', async (req, res) => {
    try {
        const result = await backupService.createFullBackup();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
