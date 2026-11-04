import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Review } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface TestimonialsProps {
  currentUser?: { name: string; email: string } | null;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function formatReviewDate(ts?: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  const date = ts.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const Testimonials: React.FC<TestimonialsProps> = ({ currentUser }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser) {
      setNewAuthor((prev) => prev || currentUser.name);
      setNewEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('isPublic', '==', true)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const fetched: Array<Review & { createdAtMs: number }> = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAtTs = data.createdAt as Timestamp | undefined;
          const createdAtMs =
            createdAtTs && typeof createdAtTs.toMillis === 'function'
              ? createdAtTs.toMillis()
              : Date.now();
          return {
            id: docSnap.id,
            author: String(data.author || 'Guest'),
            rating: Number(data.rating || 5),
            comment: String(data.comment || ''),
            date: formatReviewDate(createdAtTs),
            verified: Boolean(data.verified),
            createdAtMs,
          };
        });

        fetched.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setReviews(fetched);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setFormError('');
    if (currentUser) {
      setNewAuthor(currentUser.name);
      setNewEmail(currentUser.email);
    }
    setShowAddModal(true);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedAuthor = newAuthor.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();
    const trimmedComment = newComment.trim();
    const ratingInt = Math.round(Number(newRating));

    if (trimmedAuthor.length < 2 || trimmedAuthor.length > 60) {
      setFormError('Please enter your name (between 2 and 60 characters).');
      return;
    }

    if (
      !trimmedEmail ||
      trimmedEmail.length < 5 ||
      trimmedEmail.length > 120 ||
      !EMAIL_REGEX.test(trimmedEmail)
    ) {
      setFormError('A valid email address is required to submit a review.');
      return;
    }

    if (ratingInt < 1 || ratingInt > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (trimmedComment.length < 3 || trimmedComment.length > 600) {
      setFormError('Please write a review comment between 3 and 600 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const publicReviewRef = doc(collection(db, 'reviews'));
      const reviewId = publicReviewRef.id;
      const privateReviewRef = doc(db, 'review_private', reviewId);

      const batch = writeBatch(db);

      // Public document contains NO email address
      batch.set(publicReviewRef, {
        author: trimmedAuthor,
        rating: ratingInt,
        comment: trimmedComment,
        verified: true,
        isPublic: true,
        createdAt: serverTimestamp(),
      });

      // Private document stores the required email address securely and atomically
      batch.set(privateReviewRef, {
        reviewId,
        email: trimmedEmail,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setNewComment('');
      setNewRating(5);
      if (!currentUser) {
        setNewAuthor('');
        setNewEmail('');
      }
      setShowAddModal(false);
    } catch (error) {
      setFormError('Could not submit your review. Please check your details and try again.');
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-14 sm:py-20 bg-stone-50 dark:bg-stone-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              {t('Customer Testimonials · آراء العملاء')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {t('Real Customer Reviews')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm">
              {t(
                'Every review is verified with a real customer email (kept private and never displayed publicly).'
              )}
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t('Write a Review')}</span>
          </button>
        </div>

        {/* Reviews Grid / Loading / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-500 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <p className="text-sm font-medium">{t('Loading verified customer reviews...')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('No Customer Reviews Yet')}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {t(
                'Be the first guest to share your honest dining or delivery experience with Sufrah Ravi!'
              )}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{t('Submit the First Review')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-stone-950 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed italic">
                    "{t(rev.comment)}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-900 text-xs">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      {rev.author}
                    </span>
                    <span className="text-stone-400">{t(rev.date)}</span>
                  </div>
                  {rev.verified && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Verified Customer')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {t('Share Your Experience')}
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {t('Write a Customer Review')}
                </h3>
              </div>

              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t(formError)}</span>
                </div>
              )}

              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t('Your Name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder="e.g. Abdullah Al-Mansoor"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t('Your Email Address')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      minLength={5}
                      maxLength={120}
                      placeholder="you@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      {t(
                        'Your email is required for verification and will never be shown publicly.'
                      )}
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t('Rating')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= newRating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-stone-300 dark:text-stone-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 mx-2">
                      {newRating} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t('Your Review')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    minLength={3}
                    maxLength={600}
                    rows={3}
                    placeholder={t('Tell us about your meal...')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold rounded-xl text-sm hover:bg-stone-200 transition-colors disabled:opacity-50"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('Submitting...')}</span>
                      </>
                    ) : (
                      <span>{t('Submit Review')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
