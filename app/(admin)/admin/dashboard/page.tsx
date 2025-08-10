"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  status: string;
  submittedAt: string;
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
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [filter, setFilter] = useState("pending");
  const { admin, logout } = useAdmin();

  useEffect(() => {
    fetchProfiles();
  }, [filter]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`/api/admin/profiles?status=${filter}`);
      const data = await response.json();
      setProfiles(data.profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleProfileAction = async (
    profileId: string,
    action: string,
    reason?: string,
  ) => {
    try {
      await fetch(`/api/admin/profiles/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason,
          adminUsername: admin?.username,
        }),
      });
      fetchProfiles(); // Refresh list
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const renderActionButtons = (profile: ProfileData) => {
    if (filter === "pending") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleProfileAction(profile.id, "approve")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt("Reason for rejection (optional):");
              handleProfileAction(profile.id, "reject", reason || undefined);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Reject
          </button>
          <button
            onClick={() => {
              const reason = prompt("Reason for blocking (required):");
              if (reason) handleProfileAction(profile.id, "block", reason);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Block
          </button>
        </div>
      );
    }

    if (filter === "blocked") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const confirmUnblock = confirm(
                `Are you sure you want to unblock ${profile.name || profile.email}? This will set their profile status to rejected so that they can reapply.`,
              );
              if (confirmUnblock) {
                handleProfileAction(profile.id, "unblock");
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Unblock
          </button>
        </div>
      );
    }

    if (filter === "rejected") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleProfileAction(profile.id, "approve")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt("Reason for blocking (required):");
              if (reason) handleProfileAction(profile.id, "block", reason);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Block
          </button>
        </div>
      );
    }

    /*
    // For approved profiles, allow blocking
    if (filter === 'approved') {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const reason = prompt('Reason for blocking (required):')
              if (reason) handleProfileAction(profile.id, 'block', reason)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Block
          </button>
        </div>
      )
    }
    */

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard - Profile Management
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        {["pending", "approved", "rejected", "blocked"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`mr-4 px-4 py-2 rounded ${filter === status ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Profiles list */}
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {filter} profiles found.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white p-6 rounded-lg shadow border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {profile.name || "No name provided"}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : profile.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : profile.status === "rejected"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p>
                        <strong>Email:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {profile.phone || "Not provided"}
                      </p>
                      <p>
                        <strong>Graduation Year:</strong>{" "}
                        {profile.graduationYear || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Degree:</strong>{" "}
                        {profile.degree || "Not provided"}
                      </p>
                      <p>
                        <strong>Department:</strong>{" "}
                        {profile.department || "Not provided"}
                      </p>
                      <p>
                        <strong>Current Job:</strong>{" "}
                        {profile.currentJob || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Show rejection reason for rejected/blocked profiles */}
                  {(profile.status === "rejected" ||
                    profile.status === "blocked") &&
                    profile.rejectionReason && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm">
                          <strong>Reason:</strong> {profile.rejectionReason}
                        </p>
                      </div>
                    )}

                  <div className="text-xs text-gray-500">
                    <p>
                      Submitted:{" "}
                      {new Date(profile.submittedAt).toLocaleDateString()}
                    </p>
                    {profile.reviewedBy && profile.reviewedAt && (
                      <p>
                        Reviewed by {profile.reviewedBy} on{" "}
                        {new Date(profile.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-4">{renderActionButtons(profile)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
