"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Dashboard = () => {
  const router = useRouter();
  const [bpid, setBpid] = useState(""); // Changed from username to bpid
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!bpid || !password) {
      setError("Please enter both BPID and password.");
      return;
    }

    try {
      const response = await fetch('https://portal4.incoe.astra.co.id:4434/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bpid, password }), // Use bpid instead of username
      });

      if (response.ok) {
        // Successful login
        const data = await response.json();
        
        // Store token and user data in local storage
        localStorage.setItem('token', data.token); // Store the token
        localStorage.setItem('user', JSON.stringify(data)); // Store entire user data

        const userDataString = localStorage.getItem('user');
        let userData = null;

        if (userDataString) {
          userData = JSON.parse(userDataString);
        }

        // Example usage
        // if (userData) {
        //   console.log("User ID:", userData.id_user);
        //   console.log("User BPID:", userData.bpid);
        //   console.log("User Name:", userData.bpid_name);
        //   console.log("User Email:", userData.email);
        //   console.log("User Status:", userData.status_user);
        //   console.log("User Level:", userData.level_user);
        // } else {
        //   console.log("No user data found.");
        // }

        if (userData.level_user == 2) {
          // Admin
          router.push('/customer'); // Example: redirect to dashboard          
        } else if (userData.level_user == 1) {
          // User
          router.push('/admin/wh-component'); // Example: redirect to dashboard          
        }

        // Redirect to the appropriate page
      } else {
        // Handle login error
        const errorData = await response.json();
        setError(errorData.message || "Invalid BPID or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-base-200">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
      <div className="absolute inset-0 bg-[url('/assets/img/digital-background.png')] bg-cover bg-center opacity-30"></div>

      {/* Moving Digital Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-blue-300 moving-shape"></div>
        <div className="bg-white moving-shape"></div>
        <div className="bg-blue-200 moving-shape"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 rounded-lg shadow-md bg-base-100">
        <div className="flex justify-center mb-6"> {/* Container for logo */}
          <Image
            src="/assets/img/cbi.png"
            alt="Company Logo"
            width={150} // Adjust width as needed
            height={50} // Adjust height as needed
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bpid" className="block text-sm font-medium text-gray-700">
              BPID : (dummy : CBI000001)
            </label>
            <input
              type="text"
              id="bpid"
              className="w-full p-2 mt-1 border rounded-md"
              value={bpid}
              onChange={(e) => setBpid(e.target.value)} // Update state for bpid
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password : (dummy : 12345)
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 mt-1 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
