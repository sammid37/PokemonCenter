import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch() // sem argumentos captura TODAS as exceções da aplicação
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const { status, message } = this.getStatusAndMessage(exception);

		this.logger.error(
			`${request.method} ${request.url} → ${status}: ${message}`,
		);

		response.status(status).json({
			statusCode: status,
			message,
			path: request.url,
			timestamp: new Date().toISOString(),
		});
	}

	private getStatusAndMessage(exception: unknown): {
		status: number;
		message: string;
	} {
		// Erros HTTP do NestJS (NotFoundException, ForbiddenException, etc.)
		if (exception instanceof HttpException) {
			const response = exception.getResponse();
			const message =
				typeof response === 'string'
					? response
					: ((response as any).message ?? exception.message);

			const formattedMessage = Array.isArray(message) ? message[0] : message;

			return {
				status: exception.getStatus(),
				message: formattedMessage,
			};
		}

		if (exception instanceof QueryFailedError) {
			return this.handleDatabaseError(exception);
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Erro interno do servidor',
		};
	}

	private handleDatabaseError(exception: QueryFailedError): {
		status: number;
		message: string;
	} {
		const error = exception as any;

		if (error.code === '23505') {
			// Violação de unique constraint no PostgreSQL
			const detail: string = error.detail ?? '';

			if (detail.includes('pokedexNumber')) {
				return {
					status: HttpStatus.CONFLICT,
					message:
						'Já existe um pokémon com este número da Pokédex cadastrado por você',
				};
			}

			if (detail.includes('email')) {
				return {
					status: HttpStatus.CONFLICT,
					message: 'E-mail já cadastrado',
				};
			}

			return {
				status: HttpStatus.CONFLICT,
				message: 'Registro duplicado',
			};
		}

		if (error.code === '23503') {
			// violação de foreign key no PostgreSQL
			return {
				status: HttpStatus.BAD_REQUEST,
				message: 'Referência inválida — registro relacionado não encontrado',
			};
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Erro interno do servidor',
		};
	}
}
