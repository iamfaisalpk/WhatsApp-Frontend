import React from "react";
import { X, Search, Users, Check } from "lucide-react";

const InviteModal = ({
  showInviteModal,
  setShowInviteModal,
  chat,
  searchQuery,
  setSearchQuery,
  filteredResults,
  selectedUsers,
  handleUserSelect,
  handleAddSelectedUsers,
  handleShareInvite,
}) => {
  if (!showInviteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#111b21] text-white p-4 rounded-lg w-96 max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Participants</h3>
          <X
            size={20}
            className="cursor-pointer text-gray-400 hover:text-white"
            onClick={() => setShowInviteModal(false)}
          />
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-[#8696a0]" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, username or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2a3942] text-white placeholder-[#8696a0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery && filteredResults.length > 0 ? (
            filteredResults.map((user) => {
              const alreadyInGroup = chat.members.some(
                (m) => m._id === user._id
              );
              const isSelected = selectedUsers.includes(user._id);

              return (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-2 rounded mb-1 ${
                    alreadyInGroup
                      ? "cursor-not-allowed bg-[#1f1f1f] opacity-50"
                      : "hover:bg-[#2a3942] cursor-pointer"
                  }`}
                  onClick={() =>
                    !alreadyInGroup && handleUserSelect(user._id)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePic || "/default-avatar.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#8696a0]">{user.phone}</p>
                    </div>
                  </div>

                  {!alreadyInGroup && (
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        isSelected
                          ? "bg-[#00a884] border-[#00a884]"
                          : "border-white"
                      } flex items-center justify-center`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  )}
                </div>
              );
            })
          ) : searchQuery ? (
            <p className="text-sm text-[#8696a0] text-center mt-8">
              No users found.
            </p>
          ) : (
            <div className="text-center mt-8">
              <Users size={48} className="text-[#8696a0] mx-auto mb-4" />
              <p className="text-sm text-[#8696a0]">Type to search users</p>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-4 pt-4 border-t border-[#2a3942] space-y-2">
          {/* Share Invite Link */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8696a0]">
              Want to invite via link?
            </span>
            <button
              className="text-[#00a884] text-sm hover:underline"
              onClick={handleShareInvite}
            >
              Copy Invite Link
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              className="text-sm text-[#8696a0] hover:text-white"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelectedUsers}
              disabled={selectedUsers.length === 0}
              className={`px-4 py-1 text-sm rounded ${
                selectedUsers.length
                  ? "bg-[#00a884] text-white hover:bg-[#00967a]"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
