import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileModalContextType {
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const ProfileModalContext = createContext<ProfileModalContextType>({
  isProfileModalOpen: false,
  openProfileModal: () => {},
  closeProfileModal: () => {},
});

export const ProfileModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <ProfileModalContext.Provider
      value={{
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </ProfileModalContext.Provider>
  );
};

export const useProfileModal = () => {
  const context = useContext(ProfileModalContext);
  if (context === undefined) {
    throw new Error('useProfileModal must be used within a ProfileModalProvider');
  }
  return context;
};
