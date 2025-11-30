const redis = require('../utils/redis');

function cache(durationSeconds = 300) {
  return async (req, res, next) => {
    const key = req.originalUrl;

    try {
      const cached = await redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        return res.json(data);
      }
    } catch (err) {
      // On cache errors, just fall through
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await redis.setex(key, durationSeconds, JSON.stringify(body));
      } catch (err) {
        // ignore cache set errors
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  cache,
};
