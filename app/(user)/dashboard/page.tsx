// app/(user)/dashboard/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function UserDashboard() {
  const { data: session, update } = useSession();

  // State for editing mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    graduationYear: "",
    degree: "",
    department: "",
    currentJob: "",
    phone: "",
    company: "",
    location: "",
    linkedinUrl: "",
    profilePicture: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when session loads
  useEffect(() => {
    if (session?.user?.alumni) {
      setFormData({
        name: session.user.alumni.name || "",
        graduationYear: session.user.alumni.graduationYear?.toString() || "",
        degree: session.user.alumni.degree || "",
        department: session.user.alumni.department || "",
        currentJob: session.user.alumni.currentJob || "",
        phone: session.user.alumni.phone || "",
        company: session.user.alumni.company || "",
        location: session.user.alumni.location || "",
        linkedinUrl: session.user.alumni.linkedinUrl || "",
        profilePicture: session.user.alumni.profilePicture || "",
        bio: session.user.alumni.bio || "",
      });
    }
  }, [session]);

  // const handleLogout = () => {
  //   signOut({ callbackUrl: "/login" });
  // };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Basic validation
      if (
        formData.graduationYear &&
        (parseInt(formData.graduationYear) < 1900 ||
          parseInt(formData.graduationYear) > 2040)
      ) {
        alert("Please enter a valid graduation year");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/user/update-alumni", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          graduationYear: formData.graduationYear
            ? parseInt(formData.graduationYear)
            : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update the session to reflect the changes
        await update();
        setIsEditing(false);

        // Update local state to reflect the changes immediately
        // The session callback will handle the database sync
        console.log("Alumni information updated successfully");
      } else {
        console.error("Failed to update alumni information:", result);
        alert(
          result.error || "Failed to update information. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating alumni information:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (session?.user?.alumni) {
      setFormData({
        name: session.user.alumni.name || "",
        graduationYear: session.user.alumni.graduationYear?.toString() || "",
        degree: session.user.alumni.degree || "",
        department: session.user.alumni.department || "",
        currentJob: session.user.alumni.currentJob || "",
        phone: session.user.alumni.phone || "",
        company: session.user.alumni.company || "",
        location: session.user.alumni.location || "",
        linkedinUrl: session.user.alumni.linkedinUrl || "",
        profilePicture: session.user.alumni.profilePicture || "",
        bio: session.user.alumni.bio || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Alumni Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back!</p>
        </div>
        {/* <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
        >
          Logout
        </button> */}
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Profile
        </h2>
        <div className="flex items-center space-x-4">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            {/* <p className="font-medium text-gray-800">{session?.user?.name}</p> */}
            <div className="flex items-center space-x-2">
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alumni Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Alumni Information
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Name</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            ) : (
              <p className="text-gray-800">
                {formData.name || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Graduation Year
            </p>
            {isEditing ? (
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) =>
                  handleInputChange("graduationYear", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter graduation year"
              />
            ) : (
              <p className="text-gray-800">
                {formData.graduationYear || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Degree</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => handleInputChange("degree", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter degree"
              />
            ) : (
              <p className="text-gray-800">
                {formData.degree || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Department</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department"
              />
            ) : (
              <p className="text-gray-800">
                {formData.department || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Current Job Title
            </p>
            {isEditing ? (
              <input
                type="text"
                value={formData.currentJob}
                onChange={(e) =>
                  handleInputChange("currentJob", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current job title"
              />
            ) : (
              <p className="text-gray-800">
                {formData.currentJob || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Phone</p>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-800">
                {formData.phone || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Company</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company"
              />
            ) : (
              <p className="text-gray-800">
                {formData.company || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            ) : (
              <p className="text-gray-800">
                {formData.location || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </p>
            {isEditing ? (
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  handleInputChange("linkedinUrl", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter LinkedIn URL"
              />
            ) : (
              <p className="text-gray-800">
                {formData.linkedinUrl || "Not specified"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Profile Picture URL
            </p>
            {isEditing ? (
              <input
                type="url"
                value={formData.profilePicture}
                onChange={(e) =>
                  handleInputChange("profilePicture", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Profile Picture URL"
              />
            ) : (
              <p className="text-gray-800">
                {formData.profilePicture || "Not specified"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Bio</p>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bio"
              />
            ) : (
              <p className="text-gray-800">{formData.bio || "Not specified"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
