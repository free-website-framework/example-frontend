import { useEffect, useState } from "react";

const timeValues = [0, 5, 10, 15, 20, 25, 30];
const actions = ["l", "p", "lek"];
type BackendData = Record<string, string[]>;

function formatDiff(ms: number) {
  const minutes = Math.floor(ms / 60000);

  const weeks = Math.floor(minutes / 10080);
  const days = Math.floor((minutes % 10080) / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  return `${weeks ? weeks + "t " : ""}${days ? days + "d " : ""}${hours ? hours + "g " : ""}${mins}m`;
}

export default function App() {
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [data, setData] = useState<BackendData>({});

  // ===== GET =====
  const fetchData = async () => {
    const res = await fetch("/timestamps");
    if (res.ok) {
      const json = await res.json();
      console.log(json);
      setData(json);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== POST =====
  const handleActionClick = async (action: string) => {
    setSelectedAction(action);

    const res = await fetch("/timestamps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action,
        delay: selectedTime,
      }),
    });

    if (res.ok) {
      fetchData();
    }
  };

  const getDiffs = (timestamps?: string[]) => {
    if (!timestamps || timestamps.length === 0) return [];

    const now = Date.now();
    const times = timestamps.map((t) => new Date(t).getTime());

    const diffs: number[] = [];

    for (let i = 0; i < times.length; i++) {
      if (i === 0) {
        diffs.push(now - times[i]);
      } else {
        diffs.push(times[i - 1] - times[i]);
      }
    }

    return diffs.slice(0, 5);
  };

  return (
    <div className="container mt-5 text-center">
      {/* ===== TIME ===== */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
        {timeValues.map((v: number) => (
          <button
            key={v}
            onClick={() => setSelectedTime(v)}
            className={`btn ${
              selectedTime === v ? "btn-primary" : "btn-outline-primary"
            }`}
          >
            {-v}
          </button>
        ))}
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="d-flex justify-content-center gap-2 flex-wrap mb-5">
        {actions.map((a: string) => (
          <button
            key={a}
            onClick={() => handleActionClick(a)}
            className={`btn ${
              selectedAction === a ? "btn-success" : "btn-outline-success"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* ===== TABLE ===== */}
      <table
        className="table table-bordered text-center"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Aktywność</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action: string) => {
            const diffs = getDiffs(data[action]);

            return (
              <tr key={action}>
                <td style={{ padding: "12px 20px" }}>{action}</td>
                {[0, 1, 2, 3, 4].map((i) => (
                  <td key={i} style={{ padding: "12px 20px" }}>
                    {diffs[i] ? formatDiff(diffs[i]) : ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
