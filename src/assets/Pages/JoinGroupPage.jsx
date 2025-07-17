import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import instance from "../Services/axiosInstance";
import { fetchChats } from "../../../utils/chatThunks";

const JoinGroupPage = () => {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("Joining group...");
  const [loading, setLoading] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (!user || !inviteToken) {
      setStatus(" You must be logged in to join a group.");
      setLoading(false);
      return;
    }

    const joinGroup = async () => {
      try {
        const res = await instance.post(`/api/chat/join/${inviteToken}`);
        setStatus(" Successfully joined the group!");
        dispatch(fetchChats());

        const id = setTimeout(() => {
          navigate("/chats");
        }, 1500);
        setTimeoutId(id);
      } catch (err) {
        const msg =
          err.response?.data?.message || " Failed to join group. Try again.";
        if (msg === "Already a member") {
          setStatus("ℹ You're already in this group. Redirecting...");
          const id = setTimeout(() => navigate("/chats"), 1500);
          setTimeoutId(id);
        } else {
          setStatus(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    joinGroup();

    return () => {
      if (timeoutId) clearTimeout(timeoutId); 
    };
  }, [inviteToken, user, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        {loading && (
          <div className="flex justify-center items-center mb-4">
            <div className="w-6 h-6 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
};

export default JoinGroupPage;
