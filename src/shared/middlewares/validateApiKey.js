import ApiKeyRepository from "../../services/client/repository/ApiKeyRepository.js";
import ResponseFormatter from "../utils/responseFormatter.js";
import logger from "../config/logger.js";

/**
 * Middleware to validate API keys for ingest requests.
 * Extracts the API key from headers (x-api-key, authorization) or query parameters,
 * validates it against the database, checks for status and expiration,
 * and attaches the key and associated client to the request object.
 */
const validateApiKey = async (req, res, next) => {
    try {
        let authHeader = req.headers['authorization'];
        let bearerKey = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            bearerKey = authHeader.substring(7);
        }

        const apiKeyVal = req.headers['x-api-key'] || bearerKey || req.query.apiKey || req.query.api_key;

        if (!apiKeyVal) {
            return res.status(401).json(ResponseFormatter.error("API key is required", 401));
        }

        // findByKeyValue will populate 'clientId'
        const key = await ApiKeyRepository.findByKeyValue(apiKeyVal);

        if (!key) {
            return res.status(401).json(ResponseFormatter.error("Invalid API key", 401));
        }

        if (!key.isActive) {
            return res.status(401).json(ResponseFormatter.error("API key is inactive", 401));
        }

        if (key.isExpired && key.isExpired()) {
            return res.status(401).json(ResponseFormatter.error("API key has expired", 401));
        }

        const client = key.clientId;
        if (!client) {
            return res.status(401).json(ResponseFormatter.error("Associated client not found for this API key", 401));
        }

        req.apiKey = key;
        req.client = client;

        next();
    } catch (error) {
        logger.error("API key validation failed:", {
            error: error.message,
            stack: error.stack,
            path: req.path
        });
        return res.status(500).json(ResponseFormatter.error("Internal server error during API key validation", 500));
    }
};

export default validateApiKey;
