import { createSignedFetcher } from 'aws-sigv4-fetch';

export const onRequest = async (context) => {
    const signedFetch = createSignedFetcher({
        service: 'lambda',
        region: 'eu-central-1',
        credentials: {
            accessKeyId: context.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: context.env.AWS_ACCESS_KEY_SECRET,
        }
    });

    const incoming = new URL(context.request.url);
    const backendUrl = new URL(incoming.pathname + incoming.search, context.env.BACKEND_URL);

    console.log({
        backendUrl: backendUrl,
    });

    let response;
    if (context.request.method == 'GET') {
        response = await signedFetch(backendUrl);
    } else {
        const body =  await context.request.text();
        console.log({
            method: 'POST',
            body: body,
        });
        response = await signedFetch(backendUrl, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: body,
        });
    }

    const responseBody = await response.text();
    console.log({
        status: response.status,
        responseBody: responseBody,
        headers: Object.fromEntries(response.headers.entries()),
    });

    return response;
};