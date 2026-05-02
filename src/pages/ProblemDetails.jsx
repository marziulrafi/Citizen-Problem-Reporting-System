import { useParams } from "react-router-dom";
import { problems } from "../data/data";
import { useState } from "react";

export default function ProblemDetails() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);

  const [votes, setVotes] = useState(problem.upvotes);

  return (
    <div className="p-4">
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>

      <button
        onClick={() => setVotes(votes + 1)}
        className="bg-green-500 text-white px-3"
      >
        Upvote ({votes})
      </button>
    </div>
  );
}