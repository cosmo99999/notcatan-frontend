import { useEffect, useRef, useState } from "react";
import { useApi } from "../useApi";
import { useAppContext } from "../App";


interface loginArgs {
  onLoginSuccess: () => void;
}
export function Login({ onLoginSuccess }: loginArgs) {

  const { setMe } = useAppContext();
  const { POST } = useApi();
  const k = localStorage.getItem("secretkey");
  const n = localStorage.getItem("name");
  const [code, setCode] = useState(k ? k : "");
  const [name, setName] = useState(n ? n : "");

  const hasCalled = useRef(false);

  async function submit() {
    const msg = {
      key: code,
      name: name,
    }
    const { success, token, message } = await POST('/login', msg);
    localStorage.setItem("secretkey", code);
    localStorage.setItem("name", name);
    if (success) {
      setMe(token)
      onLoginSuccess();
    } else {
      window.alert(message);
    }
  }
  useEffect(() => {
    if (k && n && !hasCalled.current) {
      submit();
      hasCalled.current = true;
    }
  }, []);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: '100%',
      height: '75%',
      alignItems: 'center',
      gap: '10px',
      zoom: '1.25',
    }}>
      <h1>RossCatanos!</h1>
      <h2>Please enter game code:</h2>
      <input value={code} onChange={(e) => { setCode(e.target.value) }}></input>
      <h2>Please enter your name:</h2>
      <input value={name} onChange={(e) => { setName(e.target.value) }}></input>
      <button onClick={submit}>Submit</button>
    </div>
  )
}
