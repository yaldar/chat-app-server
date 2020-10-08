/* eslint-disable import/prefer-default-export */
import winston, { format } from 'winston';

const { combine, timestamp } = format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), winston.format.json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
logger.info(
  `User nickname: ${'nickname'}, with Id: ${'socket.id'} disconnected `,
);

export { logger };
