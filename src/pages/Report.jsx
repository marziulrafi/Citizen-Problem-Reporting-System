import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { issueService } from "../api/issueService";
import { zoneService } from "../api/zoneService";
import { useAuth } from "../context/useAuth";
import MapPicker from "../components/MapPicker";
import { detectZoneFromCoordinates, getZoneLabel } from "../constants/dhakaZones";

const categories = [
  { value: "road_transportation", label: "Roads" },
  { value: "waste_management", label: "Waste Management" },
  { value: "water_sanitation", label: "Water Supply" },
  { value: "electricity", label: "Utilities" },
  { value: "public_safety", label: "Safety" },
  { value: "environmental", label: "Environment" },
  { value: "other", label: "Other" },
];

const stepMeta = [
  { title: "Basic Info", icon: "📝" },
  { title: "Details", icon: "📖" },
  { title: "Location", icon: "📍" },
  { title: "Impact", icon: "⚙️" },
  { title: "Review", icon: "✅" },
];

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [zones, setZones] = useState([]);
  const [locationMode, setLocationMode] = useState("map");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
    latitude: null,
    longitude: null,
    address: "",
    district: "Dhaka",
    upazila: "",
    ward: "",
    landmark: "",
    severity: 3,
    affectedPeople: 0,
    isAnonymous: false,
  });

  useEffect(() => {
    zoneService.getZones().then((res) => setZones(res?.data?.zones || [])).catch(() => { });
  }, []);

  const detectedZone = form.latitude != null ? detectZoneFromCoordinates(form.latitude, form.longitude, zones) : null;

  const setField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onMapChange = (lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const onPhotoChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setPhotos(selected.filter((f) => f.type.startsWith("image/")).slice(0, 5));
  };

  const validateStep = () => {
    if (step === 1 && (!form.title.trim() || !form.category)) {
      toast.error("Title and category are required");
      return false;
    }
    if (step === 2 && form.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return false;
    }
    if (step === 3) {
      const hasMap = form.latitude != null && form.longitude != null;
      const hasText = form.address.trim().length > 0;
      if (!hasMap && !hasText) {
        toast.error("Pin on map or enter a street address");
        return false;
      }
      if (!hasMap && !form.district.trim()) {
        toast.error("District is required when using text address only");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(5, prev + 1));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("category", form.category);
      fd.append("description", form.description.trim());
      fd.append("priority", form.priority);
      fd.append("address", form.address.trim());
      fd.append("district", form.district.trim() || "Dhaka");
      fd.append("division", "Dhaka");
      fd.append("upazila", form.upazila.trim());
      fd.append("ward", form.ward.trim());
      fd.append("landmark", form.landmark.trim());
      fd.append("severity", String(form.severity));
      fd.append("affectedPeople", String(form.affectedPeople));
      fd.append("isAnonymous", String(form.isAnonymous));
      if (form.latitude != null && form.longitude != null) {
        fd.append("latitude", String(form.latitude));
        fd.append("longitude", String(form.longitude));
      }
      photos.forEach((photo) => fd.append("media", photo));

      const res = await issueService.createIssue(fd);
      if (!res?.success) throw new Error(res?.message || "Failed to submit report");
      toast.success("Issue reported — routed to Dhaka zone after verification");
      navigate("/my-reports");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white p-8 mb-6 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Report an Issue</h1>
          <p className="text-emerald-100">
            Step {step} of 5 — Dhaka only. Pin your location on the map or type the address.
          </p>
        </div>

        <div className="card-elevated p-6 md:p-8">
          <div className="grid grid-cols-5 gap-2 mb-8">
            {stepMeta.map((item, idx) => {
              const n = idx + 1;
              const active = step >= n;
              return (
                <div key={item.title} className="text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold ${active ? "bg-emerald-600 text-white shadow" : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {active ? item.icon : n}
                  </div>
                  <div className="text-xs mt-2 text-slate-600 hidden sm:block">{item.title}</div>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">What happened?</h2>
              <input
                name="title"
                value={form.title}
                onChange={setField}
                placeholder="Short title for the problem"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <select
                name="category"
                value={form.category}
                onChange={setField}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Describe the issue</h2>
              <textarea
                name="description"
                value={form.description}
                onChange={setField}
                rows={7}
                placeholder="What is wrong? How long has it been there? Who is affected?"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                name="priority"
                value={form.priority}
                onChange={setField}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Where is the problem?</h2>
              <p className="text-sm text-slate-600">Dhaka metropolitan area — use the map for accurate routing to your zone authority.</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocationMode("map")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${locationMode === "map" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
                >
                  📍 Map pin
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("text")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${locationMode === "text" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
                >
                  ✏️ Type address
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("both")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${locationMode === "both" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
                >
                  Both
                </button>
              </div>

              {(locationMode === "map" || locationMode === "both") && (
                <div className="relative z-0 mb-4">
                  <MapPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={onMapChange}
                    zoneLabel={detectedZone?.name || ""}
                    height="280px"
                  />
                </div>
              )}

              {detectedZone && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                  <strong>Dhaka zone:</strong> {detectedZone.name} — {detectedZone.description}
                </div>
              )}

              {(locationMode === "text" || locationMode === "both") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="address"
                    value={form.address}
                    onChange={setField}
                    placeholder="Street / area *"
                    className="md:col-span-2 border border-slate-200 rounded-xl px-4 py-3"
                  />
                  <input
                    name="district"
                    value={form.district}
                    onChange={setField}
                    placeholder="District"
                    className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                    readOnly
                  />
                  <input
                    name="upazila"
                    value={form.upazila}
                    onChange={setField}
                    placeholder="Thana / Upazila"
                    className="border border-slate-200 rounded-xl px-4 py-3"
                  />
                  <input name="ward" value={form.ward} onChange={setField} placeholder="Ward" className="border border-slate-200 rounded-xl px-4 py-3" />
                  <input
                    name="landmark"
                    value={form.landmark}
                    onChange={setField}
                    placeholder="Nearby landmark"
                    className="border border-slate-200 rounded-xl px-4 py-3"
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Impact & evidence</h2>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Severity (1–5)</label>
                <input type="number" name="severity" min="1" max="5" value={form.severity} onChange={setField} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">People affected</label>
                <input type="number" name="affectedPeople" min="0" value={form.affectedPeople} onChange={setField} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={setField} />
                Submit anonymously
              </label>
              <div>
                <label className="block text-sm font-semibold mb-2">Photos (optional, max 5)</label>
                <input type="file" accept="image/*" multiple onChange={onPhotoChange} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2 text-sm">
              <p><strong>Title:</strong> {form.title}</p>
              <p><strong>Category:</strong> {form.category}</p>
              <p><strong>Zone:</strong> {detectedZone?.name || "Will be detected from map pin"}</p>
              <p><strong>Address:</strong> {form.address || "From map pin"}</p>
              <p><strong>Coordinates:</strong> {form.latitude != null ? `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : "—"}</p>
              <p><strong>Photos:</strong> {photos.length}</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button type="button" onClick={back} className="btn-secondary">
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < 5 ? (
              <button type="button" onClick={next} className="btn-primary">
                Next →
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={isSubmitting} className="btn-primary disabled:opacity-50">
                {isSubmitting ? "Submitting…" : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
