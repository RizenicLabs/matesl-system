import { FastifyPluginAsync, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export const errorHandler: FastifyPluginAsync = fp(async (fastify) => {
    // Global error handler
    fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        // Log error details
        fastify.log.error({
            error: error.message,
            stack: error.stack,
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
        }, 'Request error');

        // Handle validation errors
        if (error.validation) {
            reply.status(400).send({
                success: false,
                error: 'Validation failed',
                details: error.validation,
            });
            return;
        }

        // Handle authentication errors
        if (error.statusCode === 401) {
            reply.status(401).send({
                success: false,
                error: 'Authentication required',
                message: error.message,
            });
            return;
        }

        // Handle authorization errors
        if (error.statusCode === 403) {
            reply.status(403).send({
                success: false,
                error: 'Access forbidden',
                message: error.message,
            });
            return;
        }

        // Handle not found errors
        if (error.statusCode === 404) {
            reply.status(404).send({
                success: false,
                error: 'Resource not found',
                message: error.message,
            });
            return;
        }

        // Handle rate limit errors
        if (error.statusCode === 429) {
            reply.status(429).send({
                success: false,
                error: 'Too many requests',
                message: 'Please try again later',
            });
            return;
        }

        // Handle database errors
        if (error.message.includes('Prisma')) {
            reply.status(500).send({
                success: false,
                error: 'Database error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
            return;
        }

        // Handle generic server errors
        reply.status(500).send({
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
        });
    });

    // Handle not found routes
    fastify.notFound((request, reply) => {
        reply.status(404).send({
            success: false,
            error: 'Not found',
            message: 'The requested resource could not be found',
        });
    });

}, {
    name: 'errorHandler',
    fastify: '>=3.0.0',
    dependencies: ['logger'],
    decorators: {
        fastify: ['log'],
    },
}
);