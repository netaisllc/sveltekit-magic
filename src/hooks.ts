import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import type { Handle } from '@sveltejs/kit';
import { SESSION_NAME } from '$lib/config';

export const handle: Handle = async ({ request, render }) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	request.locals.userid = cookies.userid || uuid();
	request.locals[SESSION_NAME] = cookies[SESSION_NAME];

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase();
	}

	const response = await render(request);

	if (!cookies.userid) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers['set-cookie'] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
	}

	return response;
};
