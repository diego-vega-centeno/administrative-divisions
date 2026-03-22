import logger from 'loglevel';

logger.setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'silent');

export default logger;