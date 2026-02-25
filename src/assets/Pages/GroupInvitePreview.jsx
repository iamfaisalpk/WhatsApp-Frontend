import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import instance from "../Services/axiosInstance";
import { fetchChats } from "@/utils/chatThunks";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat, updateChatInList } from "../store/slices/chatSlice";
import SEO from "../Components/SEO/SEO";

const GroupInvitePreview = () => {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { isAuthLoaded, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const fetchGroupByToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await instance.get(`/api/chat/invite/${inviteToken}`);

        if (isMounted) {
          setGroupData(data.group);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err.response?.data?.message || "Invalid or expired invite link";
          setError(errorMessage);
          toast.error(errorMessage);
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (inviteToken) {
      fetchGroupByToken();
    }

    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  const handleJoinGroup = async () => {
    if (!isAuthLoaded) {
      toast.error("Please wait, loading...");
      return;
    }

    let authToken = token || localStorage.getItem("authToken");
    const refreshToken = localStorage.getItem("refreshToken");

    const redirectToPreview = () =>
      navigate("/auth", {
        state: { redirectTo: `/preview/${inviteToken}` },
      });

    if (!authToken && !refreshToken) {
      toast.error("Please login to join the group");
      return redirectToPreview();
    }

    if (!authToken && refreshToken) {
      try {
        const { data } = await instance.post("/api/token/refresh", {
          refreshToken: refreshToken.trim(),
        });

        authToken = data.accessToken;
        localStorage.setItem("authToken", authToken);
        if (data.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        return redirectToPreview();
      }
    }

    if (!authToken) {
      toast.error("Please login to join the group");
      return redirectToPreview();
    }

    try {
      setJoining(true);

      const { data } = await instance.post(
        `/api/chat/join/${inviteToken}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      toast.success("You have joined the group!");

      dispatch(updateChatInList(data.group));
      dispatch(setSelectedChat(data.group));

      navigate(`/app/chats/${data.group._id}`);
    } catch (err) {
      console.error("Join group error:", err);
      const errorMessage = err.response?.data?.message;

      switch (err.response?.status) {
        case 401:
          localStorage.clear();
          toast.error("Session expired. Please login again.");
          redirectToPreview();
          break;

        case 409:
          toast.error("You are already a member of this group");
          navigate("/app");
          break;

        case 404:
          toast.error("Group not found or invite expired");
          break;

        default:
          toast.error(errorMessage || "Failed to join group");
      }
    } finally {
      setJoining(false);
    }
  };

  // Wait for auth to load before showing content
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111b21] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884] mx-auto mb-4"></div>
          <p className="text-[#8696a0]">Loading...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111b21] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884] mx-auto mb-4"></div>
          <p className="text-[#8696a0]">Loading group information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111b21] text-white p-4">
        <div className="w-full max-w-sm bg-[#1f2c34] rounded-lg p-6 text-center shadow-lg">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-400">
            Invite Not Found
          </h2>
          <p className="text-[#8696a0] mb-4">
            {error || "Group not found or invite expired."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#8696a0] hover:bg-[#7a8a94] text-white rounded w-full transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111b21] text-white p-4">
      <SEO
        title={`Join ${groupData.groupName}`}
        description={
          groupData.groupDescription ||
          `You've been invited to join ${groupData.groupName} on PK.Chat.`
        }
        image={groupData.groupAvatar}
      />
      <div className="w-full max-w-sm bg-[#1f2c34] rounded-lg p-6 text-center shadow-lg">
        {/* Group Avatar */}
        <div className="relative mb-4">
          <img
            src={groupData.groupAvatar || "/default-avatar.png"}
            alt={groupData.groupName}
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-[#00a884]"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        {/* Group Information */}
        <h2 className="text-xl font-semibold mb-2 text-white">
          {groupData.groupName}
        </h2>

        {groupData.groupDescription && (
          <p className="text-sm text-[#8696a0] mb-4 break-words">
            {groupData.groupDescription}
          </p>
        )}

        {/* Group Stats */}
        <div className="mb-4 space-y-1">
          <p className="text-xs text-[#8696a0]">
            Created by {groupData.groupAdmin?.name || "Unknown"}
          </p>
          {groupData.memberCount && (
            <p className="text-xs text-[#8696a0]">
              {groupData.memberCount} member
              {groupData.memberCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinGroup}
          disabled={joining}
          className={`px-4 py-2 text-white rounded w-full transition-colors flex items-center justify-center ${
            joining
              ? "bg-[#8696a0] cursor-not-allowed"
              : "bg-[#00a884] hover:bg-[#00967a]"
          }`}
        >
          {joining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining...
            </>
          ) : (
            "Join Group"
          )}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-3 px-4 py-2 text-[#8696a0] hover:text-white rounded w-full transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GroupInvitePreview;
