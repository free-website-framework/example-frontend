import { createSignedFetcher } from 'aws-sigv4-fetch';

export const onRequest = async (context) => {
    console.log({
    url: context.request.url,
    method: context.request.method,
    });

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

    const response = await signedFetch(backendUrl, {
        method: context.request.method,
        body: context.request.body,
    });

    console.log("status:", response.status);

    return response;
};