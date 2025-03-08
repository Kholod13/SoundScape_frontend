import React, { createContext, useState, ReactNode } from 'react';

export interface RegistrationData {
    name?: string;
    email: string;
    password: string;
    repeatPassword: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
  }

interface RegistrationContextProps {
  registrationData: RegistrationData;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>;
}

const defaultRegistrationData: RegistrationData = {
  email: '',
  password: '',
  repeatPassword: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  gender: '',
};

export const RegistrationContext = createContext<RegistrationContextProps | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(defaultRegistrationData);

  return (
    <RegistrationContext.Provider value={{ registrationData, setRegistrationData }}>
      {children}
    </RegistrationContext.Provider>
  );
};