// frontend/src/pages/rating-page.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingComponent from "../components/rating-component";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function RatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSolutionAndTicket();
  }, [id]);

  const fetchSolutionAndTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/solutions/ticket/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSolution(data.solution);
        setTicket(data.solution.ticketId);
        setExistingRating(data.userRating);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (ratingData) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/solutions/ticket/${id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ratingData),
        }
      );

      if (res.ok) {
        navigate(`/tickets/${id}/solution`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/tickets/${id}/solution`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!solution || !ticket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-error" />
          <h2 className="mt-4 text-2xl font-bold">Solution not found</h2>
          <p>Could not load the solution details for this ticket.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <RatingComponent
        solution={solution}
        ticket={ticket}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitLoading}
        existingRating={existingRating}
      />
    </div>
  );
}