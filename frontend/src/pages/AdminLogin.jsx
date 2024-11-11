import React, { useState, useEffect } from 'react';  
import PasswordInput from '../components/PasswordInput';
import { RiUserLine } from 'react-icons/ri'; 
import loginLogo from '../assets/iControlLight.png'; 
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom'; 
import { FaUser } from "react-icons/fa";

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useLogin();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('user');
    }, []);
    
    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await login(email, password, 'admin');
        if (response && response.role === 'admin') {
            navigate('/admin-dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-100">
            <div className="absolute top-10 flex flex-col items-center">
                <img src={loginLogo} alt="Login Logo" className="w-32 mb-2" />
            </div>

            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold text-gray-800 text-center">Login</h1>
                <div className="flex justify-center">
                    <div className="flex items-center my-2 w-full">
                        <hr className='flex-grow h-[1px] bg-gray-300' />
                        <span className="flex-grow-0 mx-1 text-gray-500">As</span>
                        <hr className='flex-grow h-[1px] bg-gray-300' />
                    </div>
                </div>
                <div className={`px-6 py-2 mb-4 font-bold rounded-full flex items-center justify-center gap-2 border border-gray-300 'bg-light-activeLink text-light-primary`} >
                    <FaUser />
                    Admin
                </div>
                

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-gray-700">Username</label>
                        <div className="flex items-center mt-1 border border-gray-300 rounded-lg p-2">
                            <RiUserLine className="text-xl text-black" />
                            <input 
                                id="username" 
                                type="text" 
                                placeholder="Enter Username" 
                                className="w-full pl-3 bg-transparent text-sm outline-none text-black"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <PasswordInput
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    <button 
                        type="submit" 
                        className="w-full py-3 text-white bg-orange-500 rounded-lg font-semibold hover:bg-orange-600">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;