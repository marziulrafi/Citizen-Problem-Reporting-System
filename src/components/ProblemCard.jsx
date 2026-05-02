import { Link } from "react-router-dom";

export default function ProblemCard({ p }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold">{p.title}</h2>
      <p>{p.category}</p>
      <p>Status: {p.status}</p>
      <Link to={`/problem/${p.id}`} className="text-blue-500">
        View Details
      </Link>
    </div>
  );
}