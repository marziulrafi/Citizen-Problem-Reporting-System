import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    imageUrl: "https://via.placeholder.com/400x250?text=Issue+Image",
    upvotes: 0,
    status: "pending",
    dateReported: new Date().toISOString().split('T')[0],
    resolutionNotes: ""
  });

  const categories = [
    { value: "Roads", label: "Roads", icon: "🛣️", color: "from-orange-500 to-red-500" },
    { value: "Sanitation", label: "Waste Management", icon: "🗑️", color: "from-green-500 to-emerald-500" },
    { value: "Water Supply", label: "Water Supply", icon: "💧", color: "from-blue-500 to-cyan-500" },
    { value: "Utilities", label: "Utilities", icon: "⚡", color: "from-yellow-500 to-amber-500" },
    { value: "Traffic", label: "Traffic", icon: "🚦", color: "from-red-500 to-pink-500" },
    { value: "Health", label: "Health", icon: "🏥", color: "from-teal-500 to-green-500" },
    { value: "Infrastructure", label: "Infrastructure", icon: "🏗️", color: "from-purple-500 to-indigo-500" },
    { value: "Environment", label: "Environment", icon: "🌿", color: "from-emerald-500 to-teal-500" },
    { value: "Safety", label: "Safety", icon: "🛡️", color: "from-orange-500 to-red-500" },
    { value: "Parks", label: "Parks & Recreation", icon: "🎠", color: "from-lime-500 to-green-500" }
  ];

  const locations = [
    "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", 
    "Barisal", "Rangpur", "Mymensingh", "Comilla", "Narayanganj"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.title) {
      toast.error("Please enter a title");
      return;
    }
    if (currentStep === 2 && !formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (currentStep === 3 && !formData.description) {
      toast.error("Please enter a description");
      return;
    }
    if (currentStep === 4 && !formData.location) {
      toast.error("Please select a location");
      return;
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to report an issue");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Get existing problems from localStorage or use empty array
      const existingProblems = JSON.parse(localStorage.getItem("problems")) || [];
      
      // Create new problem
      const newProblem = {
        id: Date.now().toString(),
        ...formData,
        citizenName: user.name || user.email.split("@")[0],
        citizenEmail: user.email,
        upvotes: 0,
        status: "pending",
        dateReported: new Date().toISOString().split('T')[0],
        resolutionNotes: ""
      };

      // Save to localStorage
      existingProblems.push(newProblem);
      localStorage.setItem("problems", JSON.stringify(existingProblems));

      toast.success("Issue reported successfully!");
      navigate("/my-reports");
    }, 1500);
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to report a civic issue</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Login Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Report an Issue
          </h1>
          <p className="text-gray-600 text-lg">
            Help us improve your neighborhood by reporting civic issues
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? "✓" : step}
                  </div>
                  <div className="text-xs mt-2 text-gray-600 hidden sm:block">
                    {step === 1 && "Title"}
                    {step === 2 && "Category"}
                    {step === 3 && "Description"}
                    {step === 4 && "Location"}
                    {step === 5 && "Review"}
                  </div>
                </div>
                {step < 5 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <div className="inline-block px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm font-semibold text-gray-600">
                Step {currentStep} of 5 • {Math.round((currentStep / 5) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Step 1: Title */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">What's the issue?</h2>
                  <p className="text-gray-600">Give your report a clear and concise title</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Large pothole on Main Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific and descriptive (max 100 characters)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl mb-4">🏷️</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Category</h2>
                  <p className="text-gray-600">Choose the category that best describes the issue</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.category === cat.value
                          ? `border-green-500 bg-gradient-to-r ${cat.color} bg-opacity-10 shadow-lg`
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-800">{cat.label}</div>
                          <div className="text-xs text-gray-500">{cat.value}</div>
                        </div>
                        {formData.category === cat.value && (
                          <span className="ml-auto text-green-500 text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl mb-4">📖</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Describe the Issue</h2>
                  <p className="text-gray-600">Provide detailed information about the problem</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Describe what's happening, how long it's been going on, and any other relevant details..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be as detailed as possible to help authorities understand the severity
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl mb-4">📍</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Where is it located?</h2>
                  <p className="text-gray-600">Select the city where the issue is occurring</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select a location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm text-blue-800 font-semibold">Note:</p>
                      <p className="text-xs text-blue-700">
                        For more precise location, you can add specific landmarks or street names in the description.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Report</h2>
                  <p className="text-gray-600">Please verify all information before submitting</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">Title:</span>
                    <span className="text-gray-800 text-right max-w-[60%]">{formData.title}</span>
                  </div>
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">Category:</span>
                    <span className="text-gray-800">
                      {categories.find(c => c.value === formData.category)?.icon} {formData.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">Description:</span>
                    <span className="text-gray-800 text-right max-w-[60%]">{formData.description}</span>
                  </div>
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">Location:</span>
                    <span className="text-gray-800">{formData.location}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-600">Reported By:</span>
                    <span className="text-gray-800">{user.name || user.email}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-sm text-yellow-800 font-semibold">Before Submitting:</p>
                      <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                        <li>• Ensure all information is accurate</li>
                        <li>• False reports may be subject to review</li>
                        <li>• You can track this report in "My Reports"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  ← Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 ml-auto"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@cprs.gov.bd" className="text-green-600 hover:underline">
              support@cprs.gov.bd
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}