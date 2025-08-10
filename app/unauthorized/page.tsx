import Link from "next/link";
import { Shield, Mail } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Shield className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Blocked by Admin
          </h1>

          <div className="space-y-3 text-gray-600 mb-6">
            <p>
              Your profile has been{" "}
              <strong className="text-red-600">
                blocked by our admin team
              </strong>{" "}
              and you cannot access the alumni portal.
            </p>
            <p>
              This action was taken due to policy violations or inappropriate
              content in your profile submission.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 px-2 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Mail className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Contact Required</span>
            </div>
            <p className="text-sm text-red-700">
              To request unblocking, please contact our admin team
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Include your registered email address and reason for appeal in
              your message while contacting admin.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              This decision was made by our administrative team to maintain
              platform quality and safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
