import react, { createContext, useContext, useState } from "react";

export const UserContext = createContext();
const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	
	const updatedUser=(userData) => {
		setUser(userData);
	};
	
	const clearUser=() => {
		setUser(null);
	};
	
	return (
		<UserContext.Provider value={{ user, updatedUser, clearUser }}>
			{children}
		</UserContext.Provider>
	);
}

export default UserProvider;