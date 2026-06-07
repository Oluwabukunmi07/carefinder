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
  approved: boolean;
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
        .eq("approved", true)
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
    const { error } = await supabase
      .from("reviews")
      .insert({
        hospital_id: hospitalId,
        user_id: user.id,
        rating,
        comment,
        approved: false,
      });

    if (error) {
      alert("Error submitting review: " + error.message);
      setSubmitting(false);
      return;
    }

    alert("Review submitted! It will appear after admin approval.");
    setRating(0);
    setComment("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">
        Reviews{" "}
        <span className="text-slate-400 font-normal">({reviews.length})</span>
      </h2>

      {user ? (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <p className="text-sm font-medium text-slate-700 mb-3">
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
                  size={22}
                  className={`transition-colors ${
                    star <= (hovered || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
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
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-3"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-6 pb-5 border-b border-gray-100">
          <a
            href="/admin/login"
            className="text-emerald-600 hover:underline font-medium"
          >
            Log in
          </a>{" "}
          to leave a review
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No reviews yet. Be the first!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-50 pb-4 last:border-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
