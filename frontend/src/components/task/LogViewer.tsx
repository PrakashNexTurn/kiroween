import { useEffect, useRef, useState } from "react";
import { Card, Button, Tooltip } from "antd";
import { CopyOutlined, DeleteOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { showSuccess } from "../common/Toast";
import { parseLogsForRendering } from "../../utils/logFormatter";

export interface LogViewerProps { logs: string; isStreaming: boolean; onClear?: () => void; }

export function LogViewer({ logs, isStreaming, onClear }: LogViewerProps) {
  const [expanded, setExpanded] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(logs.length);

  useEffect(() => {
    if (logs.length > prevLength.current && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
    prevLength.current = logs.length;
  }, [logs]);

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      showSuccess("Logs copied!");
    } catch (err) {
      console.error(err);
    }
  };

  const clearLogs = () => onClear?.();

  return (
    <Card
      bordered
      style={{
        background: "#0d0d0d",
        borderRadius: 10,
        border: "1px solid #222",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.4)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          background: "#111",
          padding: "10px 16px",
          borderBottom: "1px solid #222",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#e6e6e6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Execution Logs</span>

          {isStreaming && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#4096ff",
                  animation: "pulse 1s infinite",
                }}
              />
              <span style={{ fontSize: 12, color: "#999" }}>Streaming...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tooltip title="Copy logs">
            <Button
              size="small"
              disabled={!logs}
              onClick={copyLogs}
              icon={<CopyOutlined />}
              style={{
                background: "transparent",
                color: "#ccc",
                border: "none",
              }}
            />
          </Tooltip>

          <Tooltip title="Clear logs">
            <Button
              size="small"
              disabled={!logs || isStreaming}
              onClick={clearLogs}
              icon={<DeleteOutlined />}
              style={{
                background: "transparent",
                color: "#ccc",
                border: "none",
              }}
            />
          </Tooltip>

          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
              style={{
                background: "transparent",
                color: "#ccc",
                border: "none",
              }}
            />
          </Tooltip>
        </div>
      </div>

      {/* Logs Panel */}
      <div
        ref={logRef}
        style={{
          maxHeight: expanded ? 380 : 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: expanded ? "15px" : "0px",
          transition: "all 0.25s ease-in-out",
          background: "#0d0d0d",
        }}
      >
        {logs ? (
          <div
            style={{
              color: "#e0e0e0",
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: "1.45",
              whiteSpace: "pre-wrap",
            }}
          >
            {parseLogsForRendering(logs).map((line, i) => (
              <div key={i} style={{ marginBottom: 2 }}>
                {line.segments.map((segment, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      color: segment.color || "#cfcfcf",
                      fontWeight: segment.bold ? "bold" : "normal",
                    }}
                  >
                    {segment.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontFamily: "monospace",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No logs yet. Execute a task.
          </div>
        )}
      </div>
    </Card>
  );
}
