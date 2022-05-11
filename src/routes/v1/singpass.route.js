const express = require('express');
const singpassController = require('../../controllers/singpass.controller');

const router = express.Router();

router.get('/reauth', singpassController.reauthorize);
router.post('/callback', singpassController.callback);

module.exports = router;
