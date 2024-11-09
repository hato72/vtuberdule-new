import GroupIcon from "../atoms/groupIcon"
import ActionControlsButton from "../atoms/actionControlButton"
import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import LoginModal from "../auth/LoginModal"
import { auth } from "@/lib/firebase"

interface Props {
  isOpenDrawer: boolean
  isFixedVideo: boolean
  toggleDrawer: () => void
  toggleFixedVideo: () => void
  onSearch: (query:string) => void
}

const Header = ({ isOpenDrawer, isFixedVideo, toggleDrawer, toggleFixedVideo, onSearch }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, userPreferences } = useAuth();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <>
      <div className="bg-[#eaeaef] w-full h-[70px] flex items-center justify-between py-4 px-3">
        <div className="flex items-center">
          <div className="hidden md:block">
            <GroupIcon />
          </div>
          <ActionControlsButton
            isOpenDrawer={isOpenDrawer}
            isFixedVideo={isFixedVideo}
            toggleDrawer={toggleDrawer}
            toggleFixedVideo={toggleFixedVideo}
          />
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
          />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => auth.signOut()}
                className="px-4 py-1 text-sm text-red-500 border border-red-500 rounded hover:bg-red-50"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-1 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
            >
              ログイン
            </button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;