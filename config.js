export const config = {
    port: process.env.PORT || 3001,
    antilopay: {
        baseUrl: 'https://lk.antilopay.com/api/v1',
        projectId: 'P23055347050433270',
        privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAz0+0O+Wh/KT6dEK29mSA8ooCT6jUymACnp9Km+VAEUKGPtS69JbVvZEoU4qyzgAi56eZmh7lssqnzSJ5h5rxWwIDAQABAkA0BLdgWi/pwYnYt07Kh5B1i1ymGWJ/f1TY8XZapM0NJzT1o5JyRtrLYHeZtyRt9PYH30DHoCVvMWSnB6qKUo31AiEA7dC2CtRNtlHZqWClgn9fmVRAfBwPxR7JwoldD2fHQzcCIQDfKd8T6o61Ww4zE+MHxI1/n3qQf9PAd4CHOvh1lwic/QIhAIr2NRl42vwZMd3GSpBJi3wV/iRHZXOivPR+vbEdzBLbAiBC3DWkruqwtSYs8XFcm2vVZ7992X5ktKkCWw2jlWuUNQIgbzvK8ctY/3z0XHfW4u+HCvLpsissOBxszgfety15UDI=
-----END RSA PRIVATE KEY-----`
    },
    steamCurrency: {
        token: 'cALqno6ByRsClOGGATlhXTE7HrtrNpp84S9XxCAZh7wmH'
    }
};