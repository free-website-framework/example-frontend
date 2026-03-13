import { useEffect, useState } from "react";

function App() {
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch("/dynamo");
    const j = await r.json();
    setData(j.data);
  };

  const send = async () => {
    await fetch(`/dynamo?value=${encodeURIComponent(value)}`, {
      method: "POST",
    });
    setValue("");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    fetch("/hello")
      .then((res) => res.json())
      .then((resp) => setMsg(resp.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Hello:</h1>
      <pre>{msg}</pre>
      <h1>DynamoDB:</h1>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={send}>Send</button>
      <div>value: {data}</div>
    </div>
  );
}

export default App;
