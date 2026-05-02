import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { issueService } from "../api/issueService";
import toast from "react-hot-toast";

export default function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    const loadIssue = async () => {
      try {
        const response = await issueService.getIssueById(id);
        const issue = response?.data;
        if (!issue) return;
        setProblem(issue);
        setVotes(issue.upvoteCount || 0);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load issue details");
      }
    };
    loadIssue();
  }, [id]);

  if (!problem) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>

      <button
        onClick={async () => {
          try {
            const response = await issueService.upvoteIssue(id);
            setVotes(response?.data?.upvoteCount ?? votes);
          } catch (err) {
            toast.error(err.response?.data?.message || "Unable to upvote");
          }
        }}
        className="bg-green-500 text-white px-3"
      >
        Upvote ({votes})
      </button>
    </div>
  );
}