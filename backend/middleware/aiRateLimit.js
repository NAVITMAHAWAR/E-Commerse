const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour per IP (LLM cost protection)
  message: { error: 'Too many AI requests. Limit: 30/hour. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'AI Rate limit exceeded', 
      limit: 30, 
      reset: Math.floor(Date.now() / 1000000) + 3600 
    });
  }
});

module.exports = aiRateLimiter;

