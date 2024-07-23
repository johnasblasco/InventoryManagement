import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { RiLockPasswordLine } from 'react-icons/ri'; // Importing padlock icon from react-icons

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className='px-4 w-[100%] input-box flex gap-1 items-center rounded-xl p-0 m-0 mt-2'>
      <RiLockPasswordLine className="text-lg" />
      <input 
        type={isShowPassword ? 'text' : 'password'}
        placeholder={placeholder || 'Password'}
        className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'
        value={value}
        onChange={onChange} // Use the onChange prop here
      />
      {isShowPassword ? (
        <FaRegEyeSlash
          size={22}
          className='text-primary cursor-pointer'
          onClick={toggleShowPassword}
        />
      ) : (
        <FaRegEye
          size={22}
          className='text-primary cursor-pointer'
          onClick={toggleShowPassword}
        />
      )}
    </div>
  );
};

export default PasswordInput;