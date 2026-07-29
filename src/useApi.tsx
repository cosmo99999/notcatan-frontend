
const API_URL = import.meta.env.VITE_API_URL!;
let key = localStorage.getItem("catanPlayerGuid") ? localStorage.getItem("catanPlayerGuid") : "";

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
export function useApi() {

  const GET = async (endpoint: string): Promise<any> => {
    const url = new URL(API_URL + endpoint);
    try {
      const response = await fetch(url, {
        headers: {
          ...((key !== "") && { Authorization: `Bearer ${key}` })
        },
      });
      const body = await parseBody(response);
      return body;
    } catch (error) {
      console.error("getFromEndPoint error: ", error);
    }
  }
  const POST = async (endpoint: string, obj: object): Promise<any> => {
    const url = new URL(API_URL + endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...((key !== "") && { Authorization: `Bearer ${key}` })
        },
        body: JSON.stringify(obj)
      });
      const body = await parseBody(response);
      const { token } = body;
      if (token != undefined) {
        key = token;
        localStorage.setItem("catanPlayerGuid", token);
      }
      return body;
    } catch (error) {
      console.error("postToEndPoint error: ", error);
    }
  }
  const PUT = async (endpoint: string, obj: object): Promise<any> => {
    const url = new URL(API_URL + endpoint);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...((key !== "") && { Authorization: `Bearer ${key}` })
        },
        body: JSON.stringify(obj)
      });
      const body = await parseBody(response);
      return body;
    } catch (error) {
      console.error("putToEndPoint error: ", error);
    }
  }
  const DELETE = async (endpoint: string, query: any): Promise<any> => {
    const url = new URL(API_URL + endpoint);
    if (query !== null) {
      url.search = new URLSearchParams(query).toString();
    }
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...((key !== "") && { Authorization: `Bearer ${key}` })
        }
      });
      const body = await parseBody(response);
      return body;
    } catch (error) {
      console.error("deleteFromEndpoint error: ", error);
    }
  }
  return { GET, POST, PUT, DELETE, };
}
