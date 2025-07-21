export const fetcher = async ({ queryJson, bodyJson, path, method, headers }: { queryJson?: any, bodyJson?: any, path: string, method: string, headers?: any }) => {
  let url = "http://localhost:3000/api" + path;

  let reqHeaders = headers ?? {};
  if (queryJson) {
    url += `?${new URLSearchParams(queryJson).toString()}`;
  }

  try {
    let cookies = require('next/headers').cookies;
    reqHeaders.cookie = (await cookies()).toString();
  } catch (e) {
    // Not in server environment
  }
  
  return await fetch(url, {
    body: bodyJson ? JSON.stringify(bodyJson) : null,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...reqHeaders
    },
    method: method.toUpperCase(),
  })
  .then((res) => {
    return res.json();
  });
}