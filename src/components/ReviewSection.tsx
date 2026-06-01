"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

interface ReviewSectionProps {
  hospitalId: string;
}

export default function ReviewSection({ hospitalId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });

      if (data) setReviews(data);
    };

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchReviews();
    getUser();
  }, [hospitalId]);

  const handleSubmit = async () => {
    if (!user) {
      alert("Please log in to leave a review");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        hospital_id: hospitalId,
        user_id: user.id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      alert("Error submitting review: " + error.message);
      setSubmitting(false);
      return;
    }

    setReviews((prev) => [data, ...prev]);
    setRating(0);
    setComment("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Reviews ({reviews.length})
      </h2>

      {user ? (
        <div className="mb-6 border-b pb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Leave a review
          </p>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                title={`Rate ${star} stars`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={24}
                  className={`transition-colors ${
                    star <= (hovered || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6 border-b pb-4">
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>{" "}
          to leave a review
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
