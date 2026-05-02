import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { issueService } from "../api/issueService";
import { useAuth } from "../context/AuthContext";

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
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
    address: "",
    district: "",
    upazila: "",
    ward: "",
    landmark: "",
    severity: 3,
    affectedPeople: 0,
    isAnonymous: false,
  });

  const setField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onPhotoChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const imageFiles = selected.filter((file) => file.type.startsWith("image/"));
    setPhotos(imageFiles.slice(0, 5));
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
    if (step === 3 && (!form.address.trim() || !form.district.trim())) {
      toast.error("Detailed location is required (address and district)");
      return false;
    }
    if (step === 4 && photos.length === 0) {
      toast.error("At least one photo is required");
      return false;
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
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
        address: form.address.trim(),
        district: form.district.trim(),
        upazila: form.upazila.trim(),
        ward: form.ward.trim(),
        landmark: form.landmark.trim(),
        severity: Number(form.severity),
        affectedPeople: Number(form.affectedPeople),
        isAnonymous: Boolean(form.isAnonymous),
      };

      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
      photos.forEach((photo) => fd.append("media", photo));

      const res = await issueService.createIssue(fd);
      if (!res?.success) throw new Error(res?.message || "Failed to submit report");
      toast.success("Issue reported successfully");
      navigate("/my-reports");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white p-8 mb-6 shadow-xl">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15" />
          <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/10" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 relative z-10">Report an Issue</h1>
          <p className="text-green-100 relative z-10">Step {step} of 5 - Help improve your community with accurate reports.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-5 gap-2 mb-8">
            {stepMeta.map((item, idx) => {
              const n = idx + 1;
              const active = step >= n;
              return (
                <div key={item.title} className="text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {active ? item.icon : n}
                  </div>
                  <div className="text-xs mt-2 text-gray-600 hidden sm:block">{item.title}</div>
                </div>
              );
            })}
          </div>

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">What happened?</h2>
            <input
              name="title"
              value={form.title}
              onChange={setField}
              placeholder="Issue title"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <select
              name="category"
              value={form.category}
              onChange={setField}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
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
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">Describe it clearly</h2>
            <textarea
              name="description"
              value={form.description}
              onChange={setField}
              rows={7}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none resize-none"
            />
            <select
              name="priority"
              value={form.priority}
              onChange={setField}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add detailed location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="address"
              value={form.address}
              onChange={setField}
              placeholder="Address / street *"
              className="md:col-span-2 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              name="district"
              value={form.district}
              onChange={setField}
              placeholder="District *"
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              name="upazila"
              value={form.upazila}
              onChange={setField}
              placeholder="Upazila / Thana"
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              name="ward"
              value={form.ward}
              onChange={setField}
              placeholder="Ward"
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              name="landmark"
              value={form.landmark}
              onChange={setField}
              placeholder="Nearby landmark"
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">Impact and privacy</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Severity (1-5)</label>
              <input
                type="number"
                name="severity"
                min="1"
                max="5"
                value={form.severity}
                onChange={setField}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Affected People</label>
              <input
                type="number"
                name="affectedPeople"
                min="0"
                value={form.affectedPeople}
                onChange={setField}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={setField}
              />
              Submit this report anonymously
            </label>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Photos <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPhotoChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Add up to 5 images. At least one photo is required.</p>
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((photo) => (
                    <span
                      key={`${photo.name}-${photo.lastModified}`}
                      className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1"
                    >
                      {photo.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 space-y-2 text-sm animate-fadeIn">
            <p><span className="font-semibold">Title:</span> {form.title}</p>
            <p><span className="font-semibold">Category:</span> {form.category}</p>
            <p><span className="font-semibold">Description:</span> {form.description}</p>
            <p><span className="font-semibold">Address:</span> {form.address}</p>
            <p><span className="font-semibold">District:</span> {form.district}</p>
            <p><span className="font-semibold">Upazila:</span> {form.upazila || "-"}</p>
            <p><span className="font-semibold">Ward:</span> {form.ward || "-"}</p>
            <p><span className="font-semibold">Landmark:</span> {form.landmark || "-"}</p>
            <p><span className="font-semibold">Severity:</span> {form.severity}</p>
            <p><span className="font-semibold">Affected people:</span> {form.affectedPeople}</p>
            <p><span className="font-semibold">Photos:</span> {photos.length}</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={back} className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium">
              ← Back
            </button>
          ) : <div />}
          {step < 5 ? (
            <button
              onClick={next}
              className="px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
      </div>
    </div>
  );
}
