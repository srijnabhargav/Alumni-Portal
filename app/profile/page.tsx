"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  AlertCircle,
  Clock,
  Mail,
  RefreshCw,
  XCircle,
  Edit,
  LogOut,
} from "lucide-react";

interface ProfileFormData {
  name: string;
  phone: string;
  graduationYear: string;
  degree: string;
  department: string;
  currentJob: string;
  company: string;
  location: string;
  linkedinUrl: string;
  bio: string;
  profilePicture: string;
}

interface ExistingProfile {
  id: string;
  name: string | null;
  phone: string | null;
  graduationYear: number | null;
  degree: string | null;
  department: string | null;
  currentJob: string | null;
  company: string | null;
  location: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  profilePicture: string | null;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profileStatus, setProfileStatus] = useState<string>("");
  const [existingProfile, setExistingProfile] =
    useState<ExistingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || "",
    phone: "",
    graduationYear: "",
    degree: "",
    department: "",
    currentJob: "",
    company: "",
    location: "",
    linkedinUrl: "",
    bio: "",
    profilePicture: session?.user?.image || "",
  });

  // Check profile status on component mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const checkProfileStatus = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (data.alumni) {
          const profile = data.alumni;
          setExistingProfile(profile);
          setProfileStatus(profile.status);

          // Redirect approved users to dashboard
          if (profile.status === "approved") {
            router.push("/dashboard");
            return;
          }

          // Redirect blocked users to unauthorized
          if (profile.status === "blocked") {
            router.push("/unauthorized");
            return;
          }

          // Pre-fill form data if profile exists (for rejected users)
          if (profile.status === "rejected") {
            setFormData({
              name: profile.name || session?.user?.name || "",
              phone: profile.phone || "",
              graduationYear: profile.graduationYear?.toString() || "",
              degree: profile.degree || "",
              department: profile.department || "",
              currentJob: profile.currentJob || "",
              company: profile.company || "",
              location: profile.location || "",
              linkedinUrl: profile.linkedinUrl || "",
              bio: profile.bio || "",
              profilePicture:
                profile.profilePicture || session?.user?.image || "",
            });
          }
        } else {
          // No profile exists - new user
          setProfileStatus("no_profile");
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
        setError("Failed to check profile status");
        setProfileStatus("no_profile");
        setShowForm(true);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (session?.user?.email) {
      checkProfileStatus();
    } else {
      setIsCheckingProfile(false);
    }
  }, [session, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Enhanced validation for required fields
      const requiredFields = [
        { field: "name", label: "Full Name" },
        { field: "phone", label: "Phone Number" },
        { field: "graduationYear", label: "Graduation Year" },
        { field: "degree", label: "Degree" },
        { field: "department", label: "Department" },
      ];

      const missingFields = requiredFields.filter(
        ({ field }) => !formData[field as keyof ProfileFormData]?.trim(),
      );

      if (missingFields.length > 0) {
        setError(
          `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`,
        );
        setIsLoading(false);
        return;
      }

      // Additional validation for graduation year
      const currentYear = new Date().getFullYear();
      const gradYear = parseInt(formData.graduationYear);
      if (gradYear < 1950 || gradYear > currentYear) {
        setError(
          "Please enter a valid graduation year between 1950 and current year",
        );
        setIsLoading(false);
        return;
      }

      // Prepare data
      const dataToSubmit = {
        ...formData,
        graduationYear: parseInt(formData.graduationYear),
        currentJob: formData.currentJob.trim() || null,
        company: formData.company.trim() || null,
        location: formData.location.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        bio: formData.bio.trim() || null,
        profilePicture: formData.profilePicture.trim() || null,
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh profile status
        setProfileStatus("pending");
        setShowForm(false);
        // Refetch profile data
        const refreshResponse = await fetch("/api/profile");
        const refreshData = await refreshResponse.json();
        if (refreshData.alumni) {
          setExistingProfile(refreshData.alumni);
        }
      } else {
        setError(data.error || "Failed to submit profile");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowForm(true);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Show loading state while checking profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  // PENDING STATUS VIEW
  if (profileStatus === "pending" && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-yellow-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Under Review
          </h1>

          <div className="space-y-3 text-gray-600 mb-6">
            <p>Hi {session?.user?.name?.split(" ")[0] || "there"}!</p>
            <p>
              Your alumni profile has been submitted successfully and is
              currently being reviewed by our admin team.
            </p>
            <p>
              This process typically takes 1-3 business days. You'll receive an
              email notification once your profile is approved.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">
                Submitted Profile
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Email: {session?.user?.email}
            </p>
            {existingProfile?.submittedAt && (
              <p className="text-sm text-blue-700">
                Submitted:{" "}
                {new Date(existingProfile.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Need help? Contact admin</p>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED STATUS VIEW
  // REJECTED STATUS VIEW
  if (profileStatus === "rejected" && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Rejected by Admin
          </h1>

          <div className="space-y-3 text-gray-600 mb-6">
            <p>Hi {session?.user?.name?.split(" ")[0] || "there"}!</p>
            <p>
              Your alumni profile has been{" "}
              <strong className="text-red-600">
                rejected by our admin team
              </strong>{" "}
              and needs corrections before it can be approved.
            </p>
            <p>
              You can update your profile with the correct information and
              resubmit for review.
            </p>
          </div>

          {/* Show admin feedback if available */}
          {existingProfile?.rejectionReason ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-red-800 mb-2">Admin Feedback:</h3>
              <p className="text-sm text-red-700">
                {existingProfile.rejectionReason}
              </p>
              {existingProfile.reviewedBy && existingProfile.reviewedAt && (
                <p className="text-xs text-red-600 mt-2">
                  Reviewed by Admin on{" "}
                  {new Date(existingProfile.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-1">
                No specific feedback provided
              </h3>
              <p className="text-sm text-yellow-700">
                Please contact admin to learn about the rejection reason.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleEditProfile}
              className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-semibold"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update & Resubmit Profile
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center py-2 px-4 text-gray-500 hover:text-gray-700 transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Need help? Contact admin</p>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW (for new profiles, rejected users editing, or when showForm is true)
  if (showForm || profileStatus === "no_profile") {
    const isEditMode = profileStatus === "rejected";

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditMode
              ? "Update Your Alumni Profile"
              : "Create Your Alumni Profile"}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? "Please update your profile information based on the admin feedback above."
              : "Welcome to RCEW Alumni Portal! Please fill out your profile information below. Your profile will be reviewed by our admin team before approval."}
          </p>
        </div>

        {/* Show rejection reason if in edit mode */}
        {isEditMode && existingProfile?.rejectionReason && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 mb-1">
                    Admin Feedback
                  </h3>
                  <p className="text-sm text-red-700 mb-2">
                    {existingProfile.rejectionReason}
                  </p>
                  {existingProfile.reviewedBy && existingProfile.reviewedAt && (
                    <p className="text-xs text-red-600">
                      Reviewed by Admin on{" "}
                      {new Date(
                        existingProfile.reviewedAt,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Academic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="graduationYear"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    required
                    min="1950"
                    max={new Date().getFullYear()+6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 2020"
                  />
                </div>

                <div>
                  <label
                    htmlFor="degree"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Bachelor of Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="currentJob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    id="currentJob"
                    name="currentJob"
                    value={formData.currentJob}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Google"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Additional Information{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="profilePicture"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself, your achievements, interests, or anything you'd like to share with fellow alumni..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
                >
                  {isLoading
                    ? isEditMode
                      ? "Updating Profile..."
                      : "Submitting Profile..."
                    : isEditMode
                      ? "Update Profile for Review"
                      : "Submit Profile for Review"}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                {isEditMode
                  ? "Your updated profile will be reviewed by our admin team."
                  : "Your profile will be reviewed by our admin team. You'll be notified once it's approved."}
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );
}
