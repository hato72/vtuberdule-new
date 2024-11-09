import { useContext } from "react"
import { GroupContext } from "./groupContext"
import { useAuth } from "../auth/AuthContext"

interface Props {
  setGroup: string
}

const HoloButton = ({ setGroup }: Props) => {
  const { selectedGroup, setSelectedGroup } = useContext(GroupContext)
  const { user, userPreferences, updateUserPreferences } = useAuth();

  const handleClick = async () => {
    setSelectedGroup(setGroup)
    
    if (user && userPreferences) {
      // Update selected groups history
      const updatedGroups = [
        setGroup,
        ...userPreferences.selectedGroups.filter(g => g !== setGroup).slice(0, 4)
      ];
      
      await updateUserPreferences({
        selectedGroups: updatedGroups
      });
    }
  }

  return (
    <nav 
      onClick={handleClick} 
      className={`px-2 py-4 bg-[#F3F4F6] cursor-pointer ${
        selectedGroup === setGroup ? "bg-gray-200" : ""
      }`}
    >
      <div className="block p-3 text-gray-900">
        {setGroup}
      </div>
    </nav>
  )
}

export default HoloButton