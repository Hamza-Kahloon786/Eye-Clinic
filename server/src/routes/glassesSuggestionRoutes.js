const express = require('express');
const {
  createSuggestion,
  getSuggestionByToken,
  getAllSuggestions,
  updateSuggestion,
  deleteSuggestion,
  updateSuggestionStatus,
  getOpticalStats,
} = require('../controllers/glassesSuggestionController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/', requireRole('doctor'), createSuggestion);
router.get('/', requireRole('doctor', 'optical'), getAllSuggestions);
router.get('/by-token/:tokenId', requireRole('doctor', 'optical'), getSuggestionByToken);
router.get('/stats', requireRole('optical'), getOpticalStats);
router.patch('/:id', requireRole('doctor'), updateSuggestion);
router.delete('/:id', requireRole('doctor'), deleteSuggestion);
router.patch('/:id/status', requireRole('optical'), updateSuggestionStatus);

module.exports = router;
