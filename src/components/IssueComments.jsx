import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { issueService } from "../api/issueService";
import { useAuth } from "../context/useAuth";

export default function IssueComments({ issueId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      try {
        const res = await issueService.getComments(issueId);
        if (!active) return;
        setComments(res?.data?.comments || []);
      } catch {
        if (!active) return;
        setComments([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadComments();
    return () => {
      active = false;
    };
  }, [issueId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login to comment");
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await issueService.addComment(issueId, text.trim());
      if (res?.data?.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
        setText("");
        toast.success("Comment posted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>💬</span> Updates & comments
      </h2>

      {user && (
        <form onSubmit={submit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question or add an update..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="mt-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c._id} className="border-l-2 border-green-300 pl-4">
              <p className="text-sm font-semibold text-gray-800">
                {c.author?.name || "User"}
                <span className="text-xs font-normal text-gray-400 ml-2 capitalize">
                  {c.author?.role?.replace("_", " ")}
                </span>
              </p>
              <p className="text-sm text-gray-700 mt-1">{c.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
