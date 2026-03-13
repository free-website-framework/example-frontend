import { createSignedFetcher } from 'aws-sigv4-fetch';

export const onRequest = async (context) => {
    const options = {
        service: 'lambda',
        region: 'eu-central-1',
        credentials: {
            accessKeyId: context.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: context.env.AWS_ACCESS_KEY_SECRET,
        }
        };
    const signedFetch = createSignedFetcher(options);
    const response = await signedFetch(context.env.BACKEND_URL + '/hello',
        {
            method: 'GET',
        },
        options
        );
  return response;
};