import React, { useState, useEffect } from "react";
import axios from "axios";
import { Rnd } from "react-rnd";

const OverlayManager = () => {
  const [overlays, setOverlays] = useState([]);
  const [newOverlay, setNewOverlay] = useState({
    overlay_id: "",
    content: "",
    x: 50,
    y: 50,
    width: 150,
    height: 50,
  });

  // Fetch overlays from backend
  const fetchOverlays = async () => {
    const res = await axios.get("http://localhost:5000/overlays");
    setOverlays(res.data.map(o => ({ ...o, isEditing: false })));
  };

  useEffect(() => {
    fetchOverlays();
  }, []);

  // Add overlay
  const addOverlay = async () => {
    if (!newOverlay.overlay_id || !newOverlay.content) {
      alert("Please fill ID and Content");
      return;
    }
    await axios.post("http://localhost:5000/overlays", newOverlay);
    setNewOverlay({
      overlay_id: "",
      content: "",
      x: 50,
      y: 50,
      width: 150,
      height: 50,
    });
    fetchOverlays();
  };

  // Update overlay
  const updateOverlay = async (overlay) => {
    await axios.put(`http://localhost:5000/overlays/${overlay.overlay_id}`, overlay);
    fetchOverlays();
  };

  // Delete overlay
  const deleteOverlay = async (overlay_id) => {
    await axios.delete(`http://localhost:5000/overlays/${overlay_id}`);
    fetchOverlays();
  };

  // Toggle edit mode
  const toggleEdit = (id) => {
    setOverlays((prev) =>
      prev.map((o) =>
        o.overlay_id === id ? { ...o, isEditing: !o.isEditing } : o
      )
    );
  };

  return (
    <div style={{ position: "relative", maxWidth: "700px", margin: "auto" }}>
      <h3 className="text-lg font-bold mb-2">Overlay Manager</h3>

      {/* Add Overlay Form */}
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Overlay ID"
          value={newOverlay.overlay_id}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, overlay_id: e.target.value })
          }
          style={{ marginRight: "10px" }}
        />
        <input
          placeholder="Overlay Content"
          value={newOverlay.content}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, content: e.target.value })
          }
          style={{ marginRight: "10px" }}
        />
        <button onClick={addOverlay}>Add Overlay</button>
      </div>

      {/* Livestream Preview */}
      <div style={{ position: "relative" }}>
        <img
          src="http://localhost:5000/video_feed"
          alt="Live Video"
          width="640"
          height="360"
          style={{ border: "1px solid #000" }}
        />
        {overlays.map((o) => (
          <Rnd
            key={o.overlay_id}
            size={{ width: o.width, height: o.height }}
            position={{ x: o.x, y: o.y }}
            bounds="parent"
            onDragStop={(e, d) => updateOverlay({ ...o, x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) =>
              updateOverlay({
                ...o,
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              })
            }
          >
            <div
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "5px",
                borderRadius: "5px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {o.content}
            </div>
          </Rnd>
        ))}
      </div>

      {/* Overlay CRUD Table */}
      <h4 className="mt-4">Manage Overlays</h4>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Content</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {overlays.map((o) => (
            <tr key={o.overlay_id}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {o.overlay_id}
              </td>

              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  value={o.content}
                  disabled={!o.isEditing}
                  onChange={(e) =>
                    setOverlays((prev) =>
                      prev.map((ov) =>
                        ov.overlay_id === o.overlay_id
                          ? { ...ov, content: e.target.value }
                          : ov
                      )
                    )
                  }
                  style={{
                    width: "100%",
                    background: o.isEditing ? "white" : "#f0f0f0",
                  }}
                />
              </td>

              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <button
                  onClick={() => toggleEdit(o.overlay_id)}
                  style={{
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    marginRight: "5px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  {o.isEditing ? "Cancel" : "Edit"}
                </button>

                <button
                  onClick={async () => {
                    await updateOverlay(o);
                    alert("Overlay updated successfully ✅");
                    fetchOverlays();
                  }}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    marginRight: "5px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  disabled={!o.isEditing}
                >
                  Save
                </button>

                <button
                  onClick={() => deleteOverlay(o.overlay_id)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OverlayManager;



