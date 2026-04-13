import { useEffect, useState } from "react";
import { Fragment } from "react";

const timeValues = import.meta.env.VITE_TIME_VALUES
  ? import.meta.env.VITE_TIME_VALUES.split(",").map((v: string) => parseInt(v))
  : [];
const actions = import.meta.env.VITE_ACTIONS
  ? import.meta.env.VITE_ACTIONS.split(",")
  : [];
type BackendData = Record<string, string[]>;

function formatDiff(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);

  const mins = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);

  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);

  const days = totalDays % 7;
  const weeks = Math.floor(totalDays / 7);

  if (weeks) {
    return `${weeks}w${days ? ` ${days}d` : ""}`;
  }

  if (days) {
    return `${days}d${hours ? ` ${hours}h` : ""}`;
  }

  return hours ? `${hours}h${mins ? ` ${mins}m` : ""}` : `${mins}m`;
}

export default function App() {
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [data, setData] = useState<BackendData>({});
  type Toast = { id: number; text: string; type: "success" | "error" };
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (text: string, type: Toast["type"]) => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // ===== GET =====
  const fetchData = async () => {
    const res = await fetch("/api/timestamps");
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
    try {
      setSelectedAction(action);
      const delay = selectedTime;

      const res = await fetch("/api/timestamps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, delay }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        addToast(
          `Saved "${action}" with delay ${delay} successfully`,
          "success",
        );
        fetchData();
      } else {
        addToast(
          `Error "${action}" with delay ${delay}: ${data?.message || "Failed to save"}`,
          "error",
        );
      }
    } catch (error: any) {
      addToast(`Network error: ${error?.message || "Unknown error"}`, "error");
    }
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
      <table className="table table-borderless text-center">
        <thead>
          <tr>
            <th className="px-1 py-2"></th>
            <th className="px-1 py-2">1</th>
            <th className="px-1 py-2">2</th>
            <th className="px-1 py-2">3</th>
            <th className="px-1 py-2">4</th>
            <th className="px-1 py-2">5</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action: string) => {
            const now = Date.now();
            const times =
              data[action]?.slice(0, 5).map((t) => new Date(t).getTime()) ?? [];
            const intervals = times.map((t, i, arr) =>
              i === 0 ? now - t : arr[i - 1] - t,
            );

            return (
              <Fragment key={action}>
                <tr>
                  <td className="px-1 py-2">-</td>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <td key={i} className="text-nowrap px-1 py-2">
                      {intervals[i] ? formatDiff(intervals[i]) : ""}
                    </td>
                  ))}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {/* ===== TOASTS ===== */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3 d-flex flex-column gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show align-items-center text-white border-0 ${
              toast.type === "success" ? "bg-success" : "bg-danger"
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
