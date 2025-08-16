// frontend/src/pages/solution-page.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SolutionForm from "../components/solution-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function SolutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (solutionData) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/solutions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...solutionData, ticketId: id }),
        }
      );

      if (res.ok) {
        navigate(`/moderator/tickets/${id}`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit solution");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting solution");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/moderator/tickets/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-error" />
          <h2 className="mt-4 text-2xl font-bold">Ticket not found</h2>
          <p>Could not load the ticket details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <SolutionForm
        ticket={ticket}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitLoading}
      />
    </div>
  );
}